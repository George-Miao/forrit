use std::borrow::Borrow;

use color_eyre::{
    eyre::{ensure, eyre},
    Report, Result,
};
use ejdb::{
    query::{Q, QH},
    Collection, Database,
};
use futures::stream::{self, FuturesUnordered, StreamExt};
use reqwest::Url;
use rss::{Channel, Item};
use tracing::{debug, error, info, metadata::LevelFilter, subscriber};
use transmission_rpc::{types::BasicAuth, SharableTransClient};

use crate::{model::Subscription, AsDocument, Config, Job};

#[must_use]
pub struct Server {
    req_client: reqwest::Client,
    tran_client: SharableTransClient,
    db: ejdb::Database,
    conf: Config,
}

impl Server {
    pub async fn new(path: impl Into<Vec<u8>>, conf: Config) -> Result<Self> {
        let url = conf.transmission_url.clone();
        let mut tran_client = if let Some(auth) = conf.transmission_auth.clone() {
            SharableTransClient::with_auth(
                url,
                BasicAuth {
                    user: auth.0,
                    password: auth.1,
                },
            )
        } else {
            SharableTransClient::new(url)
        };

        let res = tran_client.session_get().await.map_err(|e| eyre!(e))?;
        // tran_client.torrent_add(TorrentAddArgs)

        ensure!(res.is_ok(), "Unable to call transmission rpc");

        Ok(Self {
            req_client: Default::default(),
            tran_client,
            db: ejdb::Database::open(path)?,
            conf,
        })
    }

    fn subs(&self) -> Result<Collection> {
        self.db.collection("subscriptions").map_err(Into::into)
    }

    fn record(&self) -> Result<Collection> {
        self.db.collection("record").map_err(Into::into)
    }

    fn new_sub(&self, sub: Subscription) -> Result<()> {
        let doc = sub.as_document()?;
        self.subs()?.save(doc)?;
        Ok(())
    }

    fn get_subs(&self) -> Result<Vec<Subscription>> {
        self.subs()?
            .query(Q.empty(), QH.empty())
            .find()?
            .map(|res| res.map_err(Into::into).and_then(TryFrom::try_from))
            .collect()
    }

    async fn spawn_transmission_download(&self, job: &Job) -> Result<()> {
        let c = self.tran_client.borrow();
        Ok(())
    }

    async fn get_rss(&self, sub: &Subscription) -> Result<Vec<Item>> {
        let rss_url = sub.rss_url()?;
        let rss_content = self.req_client.get(rss_url).send().await?.bytes().await?;
        Ok(Channel::read_from(rss_content.borrow())?.items)
    }

    pub async fn retreive_jobs(&self, sub: &Subscription) -> Result<Vec<Job>> {
        let items = self.get_rss(sub).await?;
        let name = sub.bangumi_tag.get_preferred_name();
        let season = sub.season.unwrap_or(1);
        let record = self.record()?;

        debug!(?items);

        let jobs = items
            .into_iter()
            .filter_map(|x| {
                let guid = x.guid?.value;

                if record
                    .query(Q.field("guid").eq(&guid), QH.empty())
                    .count()
                    .expect("Database failure")
                    > 0
                {
                    return None;
                } else {
                    record
                        .save(bson! {
                            "guid" => guid
                        })
                        .expect("Database failure");
                }

                let filename = x.title?;
                let enc = x.enclosure?;

                let url = match Url::parse(&enc.url) {
                    Ok(url) => url,
                    Err(e) => {
                        debug!(?e, "Excluded because failed to parse url");
                        return None;
                    }
                };

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&filename) {
                        debug!(filename, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&filename) {
                        debug!(filename, "Excluded because include pattern does not match");
                        None?
                }

                let dir = self
                    .conf
                    .download_dir
                    .join(name)
                    .join(format!("S{}", season));

                Some(Job {
                    url,
                    dir,
                    filename, // TODO: Clean filename
                })
            })
            .collect();

        Ok(jobs)
    }

    pub async fn main_loop(self) -> Result<()> {
        use std::{fs, ops::Deref};

        use regex::Regex;

        use crate::bangumi_moe::v2::Current;

        let bgm = fs::read("data/bangumi.current.v2.json")?;
        let bgm: Current = serde_json::from_slice(&bgm)?;

        let example = bgm
            .bangumis
            .into_iter()
            .find(|x| x.tag_id.deref() == "62c6ce11f248710007e811b1")
            .unwrap()
            .unwrap();

        let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

        let subs = [Subscription {
            tags: vec![team.tag_id],
            bangumi_tag: example.tag,
            season: None,
            include_pattern: None,
            exclude_pattern: Some(Regex::new(r"繁")?),
        }];

        loop {
            // let subs = self.get_subs()?;
            let mut futures = subs
                .iter()
                .map(|x| async { self.retreive_jobs(x).await })
                .collect::<FuturesUnordered<_>>();

            while let Some(r) = futures.next().await {}
        }
    }
}

#[tokio::test]
async fn test_get_rss() -> Result<()> {
    use std::{fs, ops::Deref};

    use crate::{bangumi_moe::v2::Current, server::Server};

    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::INFO)
        .init();

    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id.deref() == "548fe27ef892774b140ac6e8")
        .unwrap()
        .unwrap();

    let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

    let sub = Subscription {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
        include_pattern: None,
        exclude_pattern: None,
    };

    let s = Server::new("data/test.db", Default::default()).await?;
    let sub = s.get_rss(&sub).await?;

    println!("{:#?}", sub);

    Ok(())
}

#[tokio::test]
async fn test_download() -> Result<()> {
    use std::{fs, ops::Deref, time::Duration};

    use transmission_rpc::types::{Id as TorrentId, TorrentAddedOrDuplicate};

    use crate::{bangumi_moe::v2::Current, server::Server};

    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::INFO)
        .init();

    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id.deref() == "548fe27ef892774b140ac6e8")
        .unwrap()
        .unwrap();

    let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

    let sub = Subscription {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
        include_pattern: None,
        exclude_pattern: None,
    };

    ejdb::Database::open("data/test.db")?
        .collection("record")?
        .query(Q.drop_all(), QH.empty())
        .update()?;

    let s = Server::new("data/test.db", Default::default()).await?;

    let jobs = s.retreive_jobs(&sub).await?;

    // info!("{jobs:?}");
    let mut fut = jobs
        .into_iter()
        // .take(1)
        .map(|x| async {
            let res: Result<()> = try {
                let x = x.try_into()?;
                info!(?x);

                let resp = s.tran_client.torrent_add(x).await.map_err(|e| eyre!(e))?;
                info!(?resp);
                let t = match resp.arguments {
                    TorrentAddedOrDuplicate::TorrentDuplicate(t) => t,
                    TorrentAddedOrDuplicate::TorrentAdded(t) => t,
                };
                tokio::time::sleep(Duration::from_secs(1)).await;
                let id =
                    t.id.map(TorrentId::Id)
                        .or_else(|| t.hash_string.map(TorrentId::Hash))
                        .unwrap();
                s.tran_client
                    .torrent_remove(vec![id], true)
                    .await
                    .map_err(|e| eyre!(e))?;
            };
            res
        })
        .collect::<FuturesUnordered<_>>();

    while let Some(res) = fut.next().await {
        if let Err(e) = res {
            error!(?e);
        }
    }

    Ok(())
}

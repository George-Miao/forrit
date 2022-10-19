use std::{borrow::Borrow, collections::HashSet};

use color_eyre::Result;
use ejdb::{
    query::{Q, QH},
    Collection,
};
use rss::Channel;

use crate::{model::Subscription, AsDocument, Config, Job};

#[must_use]
pub struct Server {
    client: reqwest::Client,
    db: ejdb::Database,
    cache: HashSet<String>,
    conf: Config,
}

impl Server {
    pub fn new(path: impl Into<Vec<u8>>, conf: Config) -> Result<Self> {
        Ok(Self {
            client: Default::default(),
            db: ejdb::Database::open(path)?,
            cache: Default::default(),
            conf,
        })
    }

    fn subs(&self) -> Result<Collection> {
        self.db.collection("subscriptions").map_err(Into::into)
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

    pub async fn retreive_jobs(&mut self, sub: &Subscription) -> Result<Vec<Job>> {
        let rss_url = sub.rss_url()?;
        let rss_content = self.client.get(rss_url).send().await?.bytes().await?;
        let items = Channel::read_from(rss_content.borrow())?.items;
        let name = sub.bangumi_tag.get_preferred_name();
        let season = sub.season.unwrap_or(1);

        let jobs = items
            .into_iter()
            .filter_map(|x| {
                let guid = x.guid?.value;

                if self.cache.contains(&guid) {
                    return None;
                } else {
                    self.cache.insert(guid);
                }

                let filename = x.title?;
                let enc = x.enclosure?;

                if let Some(ref exclude) = sub.exclude_pattern {
                    if exclude.is_match(&filename) {
                        None?
                    }
                }

                if let Some(ref include) = sub.include_pattern {
                    if !include.is_match(&filename) {
                        None?
                    }
                }

                let dir = self
                    .conf
                    .download_dir
                    .join(name)
                    .join(format!("S{}", season));

                Some(Job {
                    url: enc.url,
                    dir,
                    filename, // TODO: Clean filename
                })
            })
            .collect();

        Ok(jobs)
    }

    // async fn jobs(&self, sub: &Subscription) -> Result<Vec<Job>> {
    //     Ok(())
    // }

    pub async fn main_loop(self) -> Result<()> {
        loop {
            // let subs = self.get_subs()?;

            let subs = [Subscription {
                tags: todo!(),
                bangumi_tag: todo!(),
                season: todo!(),
                include_pattern: todo!(),
                exclude_pattern: todo!(),
            }];

            for sub in subs {
                let rss = self.retreive_jobs(&sub).await?;

                // for item in items {
                //     // self.create_rss_job(item)?;
                // }
            }
        }
        Ok(())
    }
}

#[tokio::test]
async fn test_rss_url() -> Result<()> {
    use std::ops::Deref;

    use color_eyre::eyre::ensure;
    use regex::Regex;

    use std::fs;

    use crate::{bangumi_moe::v2::Current, server::Server};

    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id.deref() == "62c6ce11f248710007e811b1")
        .unwrap()
        .unwrap();

    let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

    let sub = Subscription {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
        include_pattern: None,
        exclude_pattern: Some(Regex::new(r"繁")?),
    };

    let mut s = Server::new("data/main.db", Default::default())?;
    s.retreive_jobs(&sub).await?;

    let res = s.retreive_jobs(&sub).await?;
    ensure!(res.is_empty(), "Should be empty");

    Ok(())
}

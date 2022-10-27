//! ## Looping
//!
//! -> Get config
//! -> Get subscriptions
//! -> Get RSS (or potentially other sources)
//! -> Turn into jobs
//! -> Start download
//! -> Rename

#![feature(iter_intersperse)]
#![feature(let_chains)]
#![feature(try_blocks)]
#![feature(never_type)]
#![feature(once_cell)]
#![feature(generic_arg_infer)]

mod_use::mod_use![server, model, ext, config, util];
pub mod bangumi_moe;

use std::borrow::{Borrow, Cow};

use color_eyre::{
    eyre::{bail, ensure, eyre},
    Result,
};
use futures::{
    future::join_all,
    stream::{self, StreamExt},
    TryStreamExt,
};
use reqwest::{Client, Url};
use rss::{Channel, Item};
use tap::{Tap, TapFallible};
use tokio::fs;
use tracing::{debug, info};
use transmission_rpc::{types as tt, SharableTransClient};

use crate::bangumi_moe::Api;

pub struct Forrit {
    api: Api,
    req: Client,
    tran: SharableTransClient,
    subs: SerdeTree<Subscription>,
}

impl Forrit {
    pub async fn new() -> Result<Self> {
        let conf = get_config();

        fs::create_dir_all(&conf.data_dir).await?;
        fs::create_dir_all(&conf.download_dir).await?;

        let req = reqwest::Client::new();

        let api = bangumi_moe::Api::new_raw(conf.bangumi_moe_domain.to_owned(), req.clone());

        let mut tran =
            SharableTransClient::new_with_client(conf.transmission_url.clone(), req.clone());
        if let Some((user, password)) = conf.transmission_auth.clone() {
            tran.set_auth(tt::BasicAuth { user, password })
        };
        let db = sled::open(conf.db_dir())?;
        let subs = db.open_tree("subscriptions")?.into();

        let this = Self {
            api,
            req,
            tran,
            subs,
        };
        this.validate_config().await?;

        Ok(this)
    }

    async fn handle_jobs(&self, jobs: Vec<Job>) {
        let ids = join_all(jobs.into_iter().map(|x| self.download_job(x)))
            .await
            .into_iter()
            .filter_map(|r| r.warn_err().ok().flatten())
            .collect::<Vec<_>>()
            .tap_dbg(|ids| debug!(?ids));
        self.rename_files(ids).await.warn_err_end();
    }

    async fn retrieve_jobs(&self, sub: &Subscription) -> Result<Vec<Job>> {
        let items = self.get_rss(sub).await?;
        let bangumi = self.api.fetch_tag(sub.bangumi.as_str()).await?;
        let name = bangumi.preferred_name();
        let season = sub.season.unwrap_or(1);
        // let record = self.record()?;

        debug!(?items);

        let jobs = items
            .into_iter()
            .filter_map(|x| {
                let filename = x.title?;
                let enc = x.enclosure?;

                let url = Url::parse(&enc.url)
                    .tap_err(|e| debug!(?e, "Excluded because failed to parse url"))
                    .ok()?;

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&filename) {
                        debug!(filename, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&filename) {
                        debug!(filename, "Excluded because include pattern does not match");
                        None?
                }

                let dir = get_config().download_dir.join(format!("{name}/S{season}"));

                Some(Job { url, dir })
            })
            .collect();

        Ok(jobs)
    }

    async fn get_rss(&self, sub: &Subscription) -> Result<Vec<Item>> {
        let rss_url = sub
            .rss_url(&get_config().bangumi_moe_domain)?
            .tap(|rss_url| debug!(%rss_url));
        let rss_content = self
            .req
            .get(rss_url)
            .send()
            .await?
            .error_for_status()?
            .bytes()
            .await?;
        if rss_content.is_empty() {
            bail!("RSS is empty");
        }
        Ok(Channel::read_from(rss_content.borrow())?.items)
    }

    pub async fn validate_config(&self) -> Result<()> {
        let Config {
            data_dir,
            download_dir,
            ..
        } = &get_config();

        let res = self.tran.session_get().await.map_err(|e| eyre!(e))?;
        ensure!(res.is_ok(), "Unable to call transmission rpc");

        ensure!(
            data_dir.is_absolute(),
            "`data_dir` should be an absolute path"
        );
        ensure!(
            download_dir.is_absolute(),
            "`download_dir` should be an absolute path"
        );

        Ok(())
    }

    async fn rename_files(&self, ids: Vec<tt::Id>) -> Result<()> {
        self.tran
            .torrent_get(
                Some(vec![
                    tt::TorrentGetField::Id,
                    tt::TorrentGetField::HashString,
                    tt::TorrentGetField::Files,
                ]),
                Some(ids),
            )
            .await
            .map_err(|e| eyre!(e))?
            .arguments
            .torrents
            .into_stream()
            .flat_map(|t| {
                stream::repeat(
                    t.id()
                        .expect("Torrent should contains id because previously requested"),
                )
                .zip(
                    t.files
                        .expect("Torrent should contains file because previously requested")
                        .into_stream(),
                )
            })
            .for_each_concurrent(None, |(id, f)| async {
                let name = f.name;
                let Cow::Owned(modified) = normalize_title(&name) else { return };
                info!("Renaming: `{name} => {modified}`");
                self.tran
                    .torrent_rename_path(vec![id], name, modified)
                    .await
                    .warn_err_end();
            })
            .await;
        Ok(())
    }

    async fn download_job(&self, job: Job) -> Result<Option<tt::Id>> {
        let Job { url, dir } = job;

        let arg = tt::TorrentAddArgs {
            filename: Some(url.to_string()),
            download_dir: Some(
                dir.to_str()
                    .ok_or_else(|| {
                        eyre!("Path `{}` contains non UTF-8 char, skipped", dir.display())
                    })?
                    .to_owned(),
            ),
            ..tt::TorrentAddArgs::default()
        };

        match self
            .tran
            .torrent_add(arg)
            .await
            .map_err(|e| eyre!(e))?
            .arguments
        {
            tt::TorrentAddedOrDuplicate::TorrentDuplicate(_) => Ok(None),
            tt::TorrentAddedOrDuplicate::TorrentAdded(t) => {
                info!(name = ?t.name, "Torrent added");
                Ok(t.id())
            }
        }
    }

    async fn test_sub(&self, sub: &Subscription) -> Result<()> {
        sub.tags
            .iter()
            .chain(std::iter::once(&sub.bangumi))
            .into_stream()
            .then(|tag| self.api.fetch_tag(tag.as_str()))
            .try_collect::<Vec<_>>()
            .await?;
        Ok(())
    }

    pub async fn main_loop(&self) {
        let mut clock = tokio::time::interval(get_config().check_intervel);
        info!("Starting mainloop");

        loop {
            clock.tick().await;
            debug!("Checking for new episodes");
            self.subs
                .iter()
                .into_stream()
                .for_each_concurrent(None, |sub| async {
                    let Ok((_, sub)) = sub.warn_err() else {
                        return
                    };
                    match self.retrieve_jobs(&sub).await {
                        Err(error) => {
                            tracing::warn!(%error, bangumi_tag=%sub.bangumi, "Failed to retrieve jobs")
                        }
                        Ok(jobs) => {
                            if get_config().dry_run {
                                tracing::info!(?jobs);
                                return;
                            }

                            tracing::debug!(?jobs, "Adding jobs");

                            self.handle_jobs(jobs).await;
                        }
                    }
                })
                .await;
            debug!("Done");
        }
    }
}

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
// #![allow(unused_variables)]
// #![allow(dead_code)]

mod_use::mod_use![server, model, ext, config, util];
pub mod bangumi_moe;

use std::{
    borrow::{Borrow, Cow},
    sync::Arc,
};

use color_eyre::{
    eyre::{bail, ensure, eyre},
    Result,
};
use futures::{
    future::{join_all, try_join_all},
    stream::{self, StreamExt},
};
use reqwest::{Client, Url};
use rss::{Channel, Item};
use tap::{Tap, TapFallible};
use tracing::{debug, info, warn};
use transmission_rpc::{types as tt, SharableTransClient};

use crate::bangumi_moe::Api;

pub async fn main_loop(api: Api, req: Client, tran: SharableTransClient) -> ! {
    let mut clock = {
        let conf = &*get_config().await;
        tokio::time::interval(conf.check_intervel)
    };
    let tran = Arc::new(tran);

    loop {
        clock.tick().await;
        info!("tick");
        let conf = &*get_config().await;
        conf.subscription
            .iter()
            .into_stream()
            .for_each_concurrent(None, |sub| async {
                match retrieve_jobs(&req, &api, sub).await {
                    Err(e) => tracing::error!(?e, "Failed to retrieve jobs"),
                    Ok(jobs) => {
                        if conf.dry_run {
                            tracing::info!(?jobs);
                            return;
                        }

                        tracing::debug!(?jobs, "Adding jobs");

                        tokio::spawn(handle_jobs(jobs, tran.clone()));
                    }
                }
            })
            .await;
    }
}

pub async fn retrieve_jobs(req: &Client, api: &Api, sub: &Subscription) -> Result<Vec<Job>> {
    let items = get_rss(req, sub).await?;
    let bangumi = api.fetch_tag(sub.bangumi.as_str()).await?;
    let name = bangumi.preferred_name();
    let season = sub.season.unwrap_or(1);
    let conf = &*get_config().await;
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

            let dir = conf.download_dir.join(format!("{name}/S{season}"));

            Some(Job { url, dir })
        })
        .collect();

    Ok(jobs)
}

pub async fn get_rss(req: &reqwest::Client, sub: &Subscription) -> Result<Vec<Item>> {
    let rss_url = sub
        .rss_url(&get_config().await.bangumi_moe_domain)?
        .tap(|rss_url| debug!(%rss_url));
    let rss_content = req.get(rss_url).send().await?.bytes().await?;
    Ok(Channel::read_from(rss_content.borrow())?.items)
}

pub async fn validate_config(api: &Api) -> Result<()> {
    let Config {
        data_dir,
        download_dir,
        subscription,
        ..
    } = &*get_config().await;

    ensure!(
        data_dir.is_absolute(),
        "`data_dir` should be an absolute path"
    );
    ensure!(
        download_dir.is_absolute(),
        "`download_dir` should be an absolute path"
    );

    if subscription.is_empty() {
        warn!("No subscription is being tracked");
    }

    let futs = subscription.iter().map(|x| async {
        match api.fetch_tag(x.bangumi.as_str()).await {
            Ok(x) => {
                info!("Subscribed to `{}`", x.preferred_name());
                Ok(())
            }
            Err(e) => bail!("Bangumi with tag `{}` not found ({e})", x.bangumi),
        }
    });
    try_join_all(futs).await?;

    Ok(())
}

pub async fn handle_jobs(jobs: Vec<Job>, client: Arc<SharableTransClient>) {
    let ids = join_all(jobs.into_iter().map(|x| download_job(x, &client)))
        .await
        .into_iter()
        .filter_map(|r| r.warn_err().ok().flatten())
        .collect::<Vec<_>>()
        .tap_dbg(|ids| debug!(?ids));
    rename_files(ids, &client).await.warn_err_end();
}

async fn rename_files(ids: Vec<tt::Id>, client: &SharableTransClient) -> Result<()> {
    client
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
            client
                .torrent_rename_path(vec![id], name, modified)
                .await
                .warn_err_end();
        })
        .await;
    Ok(())
}

async fn download_job(job: Job, client: &SharableTransClient) -> Result<Option<tt::Id>> {
    let Job { url, dir } = job;

    let arg = tt::TorrentAddArgs {
        filename: Some(url.to_string()),
        download_dir: Some(
            dir.to_str()
                .ok_or_else(|| eyre!("Path `{}` contains non UTF-8 char, skipped", dir.display()))?
                .to_owned(),
        ),
        ..tt::TorrentAddArgs::default()
    };

    match client
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

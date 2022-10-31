//! ## Looping
//!
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

mod_use::mod_use![server, ext, config, util];

use std::{borrow::Cow, env, path::PathBuf};

use bangumi::{
    endpoints::SearchTorrents,
    rustify::{Client as RustifyClient, Endpoint},
};
use color_eyre::{
    eyre::{ensure, eyre},
    Result,
};
use forrit_core::{IntoStream, Job, Subscription};
use futures::{
    future::join_all,
    stream::{self, StreamExt},
};
use reqwest::Url;
use tap::{Pipe, Tap, TapFallible};
use tokio::{fs, select};
use tracing::{debug, info, metadata::LevelFilter};
use tracing_subscriber::{fmt, EnvFilter};
use transmission_rpc::{
    types::{self as tt, TorrentSetArgs},
    SharableTransClient,
};

use crate::{init, Config};

#[tokio::main]
async fn main() -> Result<()> {
    fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .with_env_var("FORRIT_LOG")
                .from_env_lossy()
                .add_directive("actix_server=warn".parse().unwrap()),
        )
        .init();
    color_eyre::install()?;

    let conf_path = env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            dirs::config_dir()
                .expect("Unable to find config dir")
                .join("forrit_server/config.toml")
                .tap(|dir| {
                    info!("Using default config path: {}", dir.display());
                })
        })
        .tap(|path| {
            info!("Using config path: {}", path.display());
        });

    if !conf_path.exists() {
        info!("Config file not found, creating a new one");
        Config::default().save_to_path(&conf_path).await?;
    }

    init(conf_path).await?;

    let forrit = Forrit::new().await?;

    select! {
        _ = forrit.main_loop() => {}
        res = forrit.server() => {
            res?;
        }
        res = tokio::signal::ctrl_c() => {
            info!("Ctrl-C received, exiting");
            res?;

        }
    }

    Ok(())
}

pub struct Forrit {
    bangumi_client: RustifyClient,
    tran: SharableTransClient,
    subs: SerdeTree<Subscription>,
    records: SerdeTree<Url>,
    flag: Flag,
}

impl Forrit {
    pub async fn new() -> Result<Self> {
        let conf = get_config();

        fs::create_dir_all(&conf.data_dir).await?;
        fs::create_dir_all(&conf.download_dir).await?;

        let req = reqwest::Client::new();

        let rustify = RustifyClient::new(bangumi::DEFAULT_DOMAIN, req.clone());

        let mut tran =
            SharableTransClient::new_with_client(conf.transmission_url.clone(), req.clone());
        if let Some((user, password)) = conf.transmission_auth.clone() {
            tran.set_auth(tt::BasicAuth { user, password })
        };
        let db = sled::open(conf.db_dir())?;
        let subs = db.open_tree("subscriptions")?.into();
        let records = db.open_tree("records")?.into();

        let this = Self {
            bangumi_client: rustify,
            tran,
            subs,
            records,
            flag: Flag::new(),
        };
        this.validate_config().await?;

        Ok(this)
    }

    async fn handle_jobs(&self, jobs: Vec<Job>) {
        join_all(jobs.into_iter().map(|x| self.download_job(x)))
            .await
            .into_iter()
            .filter_map(|r| r.warn_err().ok().flatten())
            .collect::<Vec<_>>()
            .tap_dbg(|ids| debug!(?ids))
            .pipe(|ids| self.postprocess(ids))
            .await
            .warn_err_end();
    }

    async fn retrieve_jobs(&self, sub: &Subscription) -> Result<Vec<Job>> {
        let torrents = SearchTorrents::builder()
            .tags(sub.tags().map(|x| x.0.to_owned()).collect::<Vec<_>>())
            .build()
            .exec(&self.bangumi_client)
            .await?
            .parse()?
            .torrents;

        let name = &sub.bangumi.name;
        let season = sub.season.unwrap_or(1);

        let config = get_config();

        debug!(?torrents);

        let jobs = torrents
            .into_iter()
            .filter_map(|torrent| {
                if !config.no_cache {
                    if let Some(url) = self.records.get(torrent.id.as_str()).ok().flatten() {
                        debug!(%url, "Excluded because record found");
                        return None;
                    }
                }

                let filename = torrent.title;

                let url = Url::parse(&torrent.magnet)
                    .tap_err(|error| {
                        debug!(
                            ?error,
                            "Excluded because failed to parse url ({})", torrent.magnet
                        )
                    })
                    .ok()?;

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&filename) {
                        debug!(filename, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&filename) {
                        debug!(filename, "Excluded because include pattern does not match");
                        None?
                }

                let dir = config.download_dir.join(format!("{name}/S{season}"));

                let _ = self
                    .records
                    .upsert(torrent.id.as_str(), &url)
                    .tap_err(|error| debug!(?error, "Error insert record into database"));

                Some(Job { url, dir })
            })
            .collect();

        Ok(jobs)
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

    async fn postprocess(&self, ids: Vec<tt::Id>) -> Result<()> {
        let config = get_config();
        let torrents = self
            .tran
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
            .torrents;
        torrents
            .iter()
            .into_stream()
            .flat_map(|t| {
                stream::repeat(
                    t.id()
                        .expect("Torrent should contains id because previously requested"),
                )
                .zip(
                    t.files
                        .as_ref()
                        .expect("Torrent should contains file because previously requested")
                        .into_stream(),
                )
            })
            .for_each_concurrent(None, |(id, f)| async {
                let name = &f.name;
                let Cow::Owned(modified) = normalize_title(name) else { return };
                info!("Renaming: `{name} => {modified}`");
                self.tran
                    .torrent_rename_path(vec![id], name.to_owned(), modified)
                    .await
                    .warn_err_end();
            })
            .await;
        self.tran
            .torrent_set(
                TorrentSetArgs {
                    tracker_add: config
                        .trackers
                        .iter()
                        .map(|x| x.as_str().to_owned())
                        .collect::<Vec<_>>()
                        .pipe(Some),
                    ..Default::default()
                },
                torrents
                    .into_iter()
                    .map(|t| t.id().unwrap())
                    .collect::<Vec<_>>()
                    .pipe(Some),
            )
            .await
            .map_err(|e| eyre!(e))?;
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

    pub async fn main_loop(&self) {
        let mut clock = tokio::time::interval(get_config().check_intervel);
        info!("Starting mainloop");

        loop {
            select! {
                _ = clock.tick() => {},
                _ = self.flag.clone() => {
                    info!("New subscription added, fetching now");
                }
            }
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
                            tracing::warn!(%error, bangumi=?sub.bangumi, "Failed to retrieve jobs")
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

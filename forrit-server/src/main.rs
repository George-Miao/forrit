//! ## Looping
//!
//! -> Get subscriptions
//! -> Get RSS (or potentially other sources)
//! -> Turn into jobs
//! -> Start download
//! -> Rename

#![allow(incomplete_features)]
#![feature(type_alias_impl_trait)]
#![feature(async_fn_in_trait)]
#![feature(iter_intersperse)]
#![feature(let_chains)]
#![feature(try_blocks)]
#![feature(once_cell)]

mod_use::mod_use![server, ext, config, util, downloaders, sites, error, event];

use std::{borrow::Cow, env, ops::Deref, path::PathBuf};

use forrit_core::{BangumiSubscription, Downloader, Event, IntoStream, Job};
use futures::{future::join_all, stream::StreamExt};
use reqwest::Url;
use tap::{Conv, Pipe, Tap, TapFallible};
use tokio::{fs, select};
use tracing::{debug, info, metadata::LevelFilter, warn};
use tracing_subscriber::{fmt, EnvFilter};

use crate::{init, sites::bangumi::Bangumi, transmission::Transmission, Config};

#[tokio::main]
async fn main() {
    fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .with_env_var("FORRIT_LOG")
                .from_env_lossy()
                .add_directive("actix_server=warn".parse().unwrap())
                .add_directive("transmission_rpc=warn".parse().unwrap()),
        )
        .init();

    drop(run().await.tap_err(|e| {
        warn!("Error: {}", e);
    }));
}

async fn run() -> Result<()> {
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

    let conf = get_config();

    let downloader = Transmission::new_from_dyn_conf(conf.downloader.deref())
        .await?
        .unwrap();
    let bangumi = Bangumi::default();

    let forrit = Forrit::new(bangumi, downloader).await?;
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

pub struct Forrit<D> {
    site: Bangumi,
    downloader: D,
    subs: SerdeTree<BangumiSubscription>,
    records: SerdeTree<Url>,
    flag: Flag,
}

impl<D: Downloader> Forrit<D> {
    pub async fn new(site: Bangumi, downloader: D) -> Result<Self> {
        let conf = get_config();

        fs::create_dir_all(&conf.data_dir).await?;

        let db = sled::open(conf.db_dir())?;
        let subs = db.open_tree("bangumi.moe")?.into();
        let records = db.open_tree("records")?.into();
        db.open_tree("events")?
            .conv::<SerdeTree<Event, TimeKey>>()
            .pipe(init_events);

        let this = Self {
            site,
            downloader,
            subs,
            records,

            flag: Flag::new(),
        };
        this.validate_config().await?;

        Ok(this)
    }

    pub async fn validate_config(&self) -> Result<()> {
        let Config { data_dir, .. } = &get_config();

        if data_dir.is_absolute() {
            Ok(())
        } else {
            Err(Error::ConfigError("data_dir must be an absolute path"))
        }
    }

    async fn handle_jobs(&self, jobs: impl Iterator<Item = Job>) {
        join_all(jobs.map(|x| {
            emit(&Event::DownloadStart { url: x.url.clone() }).unwrap();
            info!(url=%x.url, "Downloading job");
            self.downloader.download(x)
        }))
        .await
        .into_iter()
        .filter_map(|r| r.warn_err().ok().flatten())
        .collect::<Vec<_>>()
        .tap_dbg(|ids| debug!(?ids))
        .pipe(|ids| self.postprocess(ids))
        .await
        .warn_err_end();
    }

    async fn postprocess(&self, ids: Vec<D::Id>) -> Result<()> {
        let config = get_config();

        ids.iter()
            .into_stream()
            .for_each_concurrent(None, |id| async {
                self.downloader
                    .rename(id, |name| {
                        let Cow::Owned(modified) = normalize_title(name) else { return None };
                        Some(modified)
                    })
                    .await
                    .warn_err_end();
            })
            .await;
        self.downloader
            .add_tracker(ids, config.trackers.iter().map(|x| x.to_string()).collect())
            .await
            .map_err(|e| Error::AdHocError(e.into()))?;
        Ok(())
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
            let config = get_config();
            debug!("Checking for new episodes");
            self.subs
                .iter()
                .into_stream()
                .for_each_concurrent(config.rate_limit, |sub| async {
                    let Ok((_, ref sub)) = sub.warn_err() else {
                        return
                    };
                    let download_dir = config.downloader.download_dir();

                    match self.site.update(sub, download_dir).await {
                        Err(error) => {
                            emit(&Event::Warn(format!("Failed to retrieve jobs ({})", error)))
                                .unwrap();
                            warn!(%error, "Failed to retrieve jobs")
                        }
                        Ok(jobs) => {
                            if config.dry_run {
                                info!(?jobs);
                                return;
                            }

                            self.handle_jobs(jobs.into_iter().filter(|x| {
                                if self.records.get(&x.id).warn_err().ok().flatten().is_some() {
                                    false
                                } else {
                                    self.records.upsert(&x.id, &x.url).warn_err_end();
                                    info!(url = %x.url, "Adding job");
                                    emit(&Event::JobAdded(x.clone())).unwrap();
                                    true
                                }
                            }))
                            .await;
                        }
                    }
                })
                .await;
            debug!("Done");
        }
    }
}

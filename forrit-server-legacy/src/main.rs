//! ## Looping
//!
//! -> Get subscriptions
//! -> Get update
//! -> Turn into jobs
//! -> Start download
//! -> Postprocess (Rename, move, etc)

#![allow(incomplete_features)]
#![feature(type_alias_impl_trait)]
#![feature(async_fn_in_trait)]
#![feature(iter_intersperse)]
#![feature(let_chains)]
#![feature(try_blocks)]
#![feature(once_cell)]

mod_use::mod_use![server, ext, config, util, downloaders, sites, error, event];

use std::{env, path::PathBuf};

use forrit_core::{BangumiSubscription, Event, IntoStream};
use futures::stream::StreamExt;
use reqwest::Url;
use tap::{Conv, Pipe, Tap, TapFallible};
use tokio::{fs, select};
use tracing::{debug, info, metadata::LevelFilter, warn};
use tracing_subscriber::{fmt, EnvFilter};

use crate::{init, sites::bangumi::Bangumi, Config};

#[tokio::main]
async fn main() {
    fmt()
        .without_time()
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

    let downloader = Downloaders::new(conf.downloader.clone()).await?;
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

pub struct Forrit {
    site: Bangumi,
    downloader: Downloaders,
    subs: SerdeTree<BangumiSubscription>,
    records: SerdeTree<Url>,
    flag: Flag,
}

impl Forrit {
    pub async fn new(site: Bangumi, downloader: impl Into<Downloaders>) -> Result<Self> {
        let conf = get_config();
        let downloader = downloader.into();

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

                    match self.site.update(sub).await {
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

                            self.downloader
                                .handle_jobs(jobs.into_iter().filter(|job| {
                                    if self
                                        .records
                                        .get(&job.id)
                                        .warn_err()
                                        .ok()
                                        .flatten()
                                        .is_some()
                                    {
                                        false
                                    } else {
                                        self.records.upsert(&job.id, &job.url).warn_err_end();
                                        info!(url = %job.url, "Adding job");
                                        emit(&Event::JobAdded(job.clone())).unwrap();
                                        true
                                    }
                                }))
                                .await;
                        }
                    }
                })
                .await;
            self.downloader.rename_all().await.warn_err_end();
            debug!("Done");
        }
    }
}

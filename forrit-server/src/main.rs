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

use std::{
    borrow::{Borrow, Cow},
    env,
    path::PathBuf,
};

use bangumi::{
    endpoints::FetchTag,
    rustify::{Client as RustifyClient, Endpoint},
};
use color_eyre::{
    eyre::{bail, ensure, eyre},
    Result,
};
use forrit_core::{IntoStream, Job, Subscription};
use futures::{
    future::join_all,
    stream::{self, StreamExt},
};
use reqwest::{Client, Url};
use rss::{Channel, Item};
use tap::{Tap, TapFallible};
use tokio::{fs, select};
use tracing::{debug, info, metadata::LevelFilter};
use tracing_subscriber::{fmt, EnvFilter};
use transmission_rpc::{
    types::{self as tt},
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

    init(conf_path)?;

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
    req: Client,
    rustify: RustifyClient,
    tran: SharableTransClient,
    subs: SerdeTree<Subscription>,
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

        let this = Self {
            rustify,
            req,
            tran,
            subs,
            flag: Flag::new(),
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
        let bangumi = FetchTag::builder()
            .id(sub.bangumi.tag.as_str())
            .build()
            .exec(&self.rustify)
            .await?
            .parse()?;
        let name = bangumi.preferred_name();
        let season = sub.season.unwrap_or(1);

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
            .get_rss_url(&get_config().bangumi_domain)?
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

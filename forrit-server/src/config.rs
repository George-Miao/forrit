use std::{
    fmt::Debug,
    net::IpAddr,
    path::{Path, PathBuf},
    sync::OnceLock,
    time::Duration,
};

use forrit_core::{DownloaderConfig, NoopConfig};
use futures::future::try_join_all;
use reqwest::{Client, Url};
use serde::Serialize;
use tap::{Pipe, TapFallible};
use tracing::{info, warn};
use twelf::{config, Layer};

use crate::{Error, Result};

static CONF_PATH: OnceLock<PathBuf> = OnceLock::new();
static CONFIG: OnceLock<Config> = OnceLock::new();

pub async fn init(path: impl Into<PathBuf>) -> Result<()> {
    CONF_PATH
        .set(path.into())
        .map_err(|_| Error::ConfigInitError("Config path already set"))?;
    let mut config = Config::from_dir(CONF_PATH.get().unwrap())?;
    config.load_trackers().await?;
    info!("Loaded {} tracker(s)", config.trackers.len());
    CONFIG
        .set(config)
        .map_err(|_| Error::ConfigInitError("Config already set"))?;
    Ok(())
}

pub fn get_config<'a>() -> &'a Config {
    CONFIG.get().expect("Config is not initialized")
}

#[config]
#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, Serialize)]
pub struct Config {
    #[serde(default = "default::data_dir")]
    pub data_dir: PathBuf,

    #[serde(default)]
    pub dry_run: bool,

    #[serde(default = "default::check_intervel")]
    #[serde(with = "humantime_serde")]
    pub check_intervel: Duration,

    #[serde(default)]
    pub server: ServerConfig,

    #[serde(default)]
    pub trackers: Vec<Url>,

    #[serde(default)]
    pub tracker_lists: Vec<Url>,

    #[serde(default)]
    pub no_cache: bool,

    #[serde(default)]
    pub rate_limit: Option<usize>,

    pub downloader: Box<dyn DownloaderConfig>,
}

#[config]
#[derive(Debug, Clone, Serialize)]
pub struct ServerConfig {
    #[serde(default = "default::server_bind")]
    pub bind: IpAddr,

    #[serde(default = "default::server_port")]
    pub port: u16,

    #[serde(default)]
    pub auth: Option<(String, String)>,

    #[serde(default = "default::server_workers")]
    pub workers: usize,
}

pub mod default {
    use std::{net::IpAddr, path::PathBuf};

    use reqwest::Url;

    pub fn data_dir() -> PathBuf {
        dirs::data_dir().unwrap().join("forrit_server")
    }
    pub fn download_dir() -> PathBuf {
        dirs::download_dir().expect("unable to resolve download dir")
    }
    pub fn transmission_url() -> Url {
        "http://localhost:9091/transmission/rpc".parse().unwrap()
    }
    pub fn check_intervel() -> std::time::Duration {
        std::time::Duration::from_secs(60)
    }
    pub fn server_bind() -> IpAddr {
        "127.0.0.1".parse().unwrap()
    }
    pub fn server_port() -> u16 {
        9090
    }
    pub fn server_workers() -> usize {
        4
    }
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            bind: default::server_bind(),
            port: default::server_port(),
            workers: default::server_workers(),
            auth: None,
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            data_dir: default::data_dir(),
            dry_run: false,
            check_intervel: default::check_intervel(),
            trackers: Vec::new(),
            tracker_lists: Vec::new(),
            server: ServerConfig::default(),
            no_cache: false,
            downloader: NoopConfig.erase(),
            rate_limit: None,
        }
    }
}

impl Config {
    pub fn from_dir(dir: impl Into<PathBuf>) -> Result<Self> {
        Config::with_layers(&[Layer::Toml(dir.into()), Layer::Env(Some("FORRIT_".into()))])
            .map_err(Into::into)
    }

    pub async fn load_trackers(&mut self) -> Result<()> {
        let client = Client::new();
        self.tracker_lists
            .iter()
            .map(|x| async { client.get(x.as_str()).send().await?.text().await })
            .collect::<Vec<_>>()
            .pipe(try_join_all)
            .await?
            .join("\n")
            .lines()
            .filter_map(|x| {
                if x.trim().is_empty() {
                    return None;
                }
                Url::parse(x)
                    .tap_err(|error| warn!(%error, "Unable to parse url"))
                    .ok()
            })
            .into_iter()
            .for_each(|x| {
                if !self.trackers.contains(&x) {
                    self.trackers.push(x)
                }
            });
        Ok(())
    }

    pub fn db_dir(&self) -> PathBuf {
        self.data_dir.join("database")
    }

    pub async fn save_to_path(&self, path: impl AsRef<Path>) -> Result<()> {
        let t = toml::to_string_pretty(self)?;
        let path = path.as_ref();
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        tokio::fs::write(path, t).await?;
        Ok(())
    }

    pub async fn write_back(&self) -> Result<()> {
        self.save_to_path(CONF_PATH.get().expect("Config is not initialized"))
            .await
    }
}

use std::{fmt::Debug, net::IpAddr, path::PathBuf, sync::OnceLock, time::Duration};

use color_eyre::Result;
use serde::Serialize;
use tracing::info;
use twelf::{config, Layer};
use url::Url;

static CONF_PATH: OnceLock<PathBuf> = OnceLock::new();
static CONFIG: OnceLock<Config> = OnceLock::new();

pub async fn init(path: impl Into<PathBuf>) -> Result<()> {
    drop(CONF_PATH.set(path.into()));
    let config = Config::from_dir(CONF_PATH.get().unwrap())?;
    // config.load_trackers().await?;
    info!("Loaded {} tracker(s)", config.trackers.len());
    drop(CONFIG.set(config));
    Ok(())
}

pub fn get_config<'a>() -> &'a Config {
    CONFIG.get().expect("Config is not initialized")
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Auth {
    pub username: String,
    pub password: String,
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
    pub trackers: Vec<Url>,

    #[serde(default)]
    pub tracker_lists: Vec<Url>,

    #[serde(default)]
    pub no_cache: bool,

    #[serde(default)]
    pub rate_limit: Option<usize>,

    #[serde(default)]
    pub server: ServerConfig,

    pub downloader: DownloadersConfig,
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum DownloadersConfig {
    Transmission(TransmissionConfig),
    Qbittorrent(QbittorrentConfig),
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct TransmissionConfig {
    #[serde(default = "default::download_dir")]
    pub download_dir: PathBuf,

    #[serde(default = "default::transmission_url")]
    pub url: url::Url,

    #[serde(default, flatten)]
    pub auth: Option<Auth>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct QbittorrentConfig {
    #[serde(default = "default::download_dir")]
    pub download_dir: PathBuf,

    #[serde(default = "default::transmission_url")]
    pub url: url::Url,

    #[serde(flatten)]
    pub auth: Auth,
}

pub mod default {
    use std::{net::IpAddr, path::PathBuf};

    use url::Url;

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

impl Config {
    pub fn new(downloader: DownloadersConfig) -> Self {
        Self {
            data_dir: default::data_dir(),
            dry_run: false,
            check_intervel: default::check_intervel(),
            trackers: Vec::new(),
            tracker_lists: Vec::new(),
            server: ServerConfig::default(),
            no_cache: false,
            downloader,
            rate_limit: None,
        }
    }
}

impl Config {
    pub fn from_dir(dir: impl Into<PathBuf>) -> Result<Self> {
        Config::with_layers(&[Layer::Toml(dir.into()), Layer::Env(Some("FORRIT_".into()))])
            .map_err(Into::into)
    }

    // pub async fn load_trackers(&mut self) -> Result<()> {
    //     let client = Client::new();
    //     self.tracker_lists
    //         .iter()
    //         .map(|x| async { client.get(x.as_str()).send().await?.text().await })
    //         .collect::<Vec<_>>()
    //         .pipe(try_join_all)
    //         .await?
    //         .join("\n")
    //         .lines()
    //         .filter_map(|x| {
    //             if x.trim().is_empty() {
    //                 return None;
    //             }
    //             Url::parse(x)
    //                 .tap_err(|error| warn!(%error, "Unable to parse url"))
    //                 .ok()
    //         })
    //         .into_iter()
    //         .for_each(|x| {
    //             if !self.trackers.contains(&x) {
    //                 self.trackers.push(x)
    //             }
    //         });
    //     Ok(())
    // }

    pub fn db_dir(&self) -> PathBuf {
        self.data_dir.join("database")
    }
}

#![feature(once_cell_try)]

use std::{net::SocketAddr, num::NonZeroU32, sync::OnceLock, time::Duration};

use camino::{Utf8Path, Utf8PathBuf};
use figment::{
    providers::{Env, Format, Json, Toml, Yaml},
    Figment,
};
use serde::{Deserialize, Serialize};
use tracing::info;
use url::Url;

mod util;

/// Default values for the configuration
mod default;

use default::*;
use util::MapOrVec;

static CONFIG: OnceLock<Config> = OnceLock::new();

const MINUTE: Duration = Duration::from_secs(60);
const ENV_PREFIX: &str = "FORRIT.";

pub fn init_config(dir: Option<impl AsRef<Utf8Path>>) -> Result<&'static Config, figment::Error> {
    CONFIG.get_or_try_init(|| {
        if let Some(dir) = dir.as_ref().map(AsRef::as_ref) {
            info!("Loading config from {dir} and environment");

            match dir.extension() {
                None | Some("toml") => Figment::new().join(Toml::file(dir)),
                Some("yaml") | Some("yml") => Figment::new().join(Yaml::file(dir)),
                Some("json") => Figment::new().join(Json::file(dir)),
                _ => panic!("Unsupported config file format"),
            }
        } else {
            info!("Loading config from config files and environment");

            let conf_dir = dirs::config_dir()
                .expect("failed to find config directory")
                .join("forrit");
            Figment::new()
                .merge(Toml::file(conf_dir.join("config.toml")))
                .merge(Yaml::file(conf_dir.join("config.yaml")))
                .merge(Json::file(conf_dir.join("config.json")))
        }
        .merge(Env::prefixed(ENV_PREFIX).split('.'))
        .extract()
    })
}

pub fn get_config() -> &'static Config {
    CONFIG.get().expect("config not loaded")
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Config {
    /// Resolver related configuration
    pub resolver: ResolverConfig,

    /// Database related configuration
    pub database: DatabaseConfig,

    /// Sourcer related configuration
    #[serde(default)]
    pub sourcer: MapOrVec<SourcerConfig>,

    /// Subscription related configuration
    #[serde(default)]
    pub subscription: SubscriptionConfig,

    /// Downloader related configuration
    pub downloader: DownloaderConfig,

    /// API related configuration
    #[serde(default)]
    pub api: ApiConfig,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ResolverConfig {
    /// API key for the TMDB API
    pub tmdb_api_key: String,

    /// Number of requests per second
    #[serde(default = "resolver::tmdb_rate_limit")]
    pub tmdb_rate_limit: NonZeroU32,

    /// Index configuration
    #[serde(default)]
    pub index: IndexConfig,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IndexConfig {
    /// Enable the index, default to true
    #[serde(default = "enable")]
    pub enable: bool,

    /// Start indexing from the beginning, default to true
    #[serde(default = "resolver::index::start_at_begin")]
    pub start_at_begin: bool,

    /// Interval to update the index, default to 7 days
    #[serde(with = "humantime_serde", default = "resolver::index::interval")]
    pub interval: Duration,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DatabaseConfig {
    /// URL of the mongo database, default to `mongodb://localhost:27017`
    #[serde(default = "database::url")]
    pub url: String,

    /// Name of the database, default to `forrit`
    #[serde(default = "database::database")]
    pub database: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SourcerConfig {
    /// Enable the sourcer, default to true
    #[serde(default = "enable")]
    pub enable: bool,

    #[serde(flatten)]
    pub ty: SourcerType,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum SourcerType {
    Rss(RssConfig),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RssConfig {
    /// URL of the RSS feed
    pub url: Url,

    /// Interval to fetch the RSS, default to 5 minutes
    #[serde(with = "humantime_serde", default = "sourcer::rss::update_interval")]
    pub update_interval: Duration,

    /// Deny items with mime type other than `application/x-bittorrent`, default
    /// to false
    #[serde(default = "sourcer::rss::deny_non_torrent")]
    pub deny_non_torrent: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct SubscriptionConfig {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DownloaderConfig {
    /// Rename configuration
    #[serde(default)]
    pub rename: RenameConfig,

    #[serde(flatten)]
    pub ty: DownloaderType,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RenameConfig {
    /// Enable renaming, default to true
    #[serde(default = "enable")]
    pub enable: bool,

    /// Interval to check and rename the downloaded torrent, default to 5
    /// minutes
    #[serde(with = "humantime_serde", default = "downloader::rename::interval")]
    pub interval: Duration,

    /// Rename format
    #[serde(default)]
    pub format: RenameFormat,
}

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize, Default)]
#[serde(untagged, rename_all = "lowercase")]
pub enum RenameFormat {
    #[default]
    Full,
    Short,
    // Custom(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum DownloaderType {
    Transmission(TransmissionConfig),
    Qbittorrent(QbittorrentConfig),
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct Auth {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct TransmissionConfig {
    /// Save path for the downloaded torrent, leave it empty to use the default
    #[serde(default)]
    pub savepath: Option<Utf8PathBuf>,

    /// URL of the transmission API
    #[serde(default = "downloader::transmission::url")]
    pub url: url::Url,

    #[serde(default, flatten)]
    pub auth: Option<Auth>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct QbittorrentConfig {
    #[serde(with = "humantime_serde", default = "downloader::qbittorrent::check_interval")]
    pub check_interval: Duration,

    /// Save path for the downloaded torrent, leave it empty to use the default
    #[serde(default)]
    pub savepath: Option<Utf8PathBuf>,

    /// URL of the qBittorrent API
    #[serde(default = "downloader::qbittorrent::url")]
    pub url: url::Url,

    #[serde(flatten)]
    pub auth: Auth,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApiConfig {
    /// Enable the API, default to true
    #[serde(default = "enable")]
    pub enable: bool,

    /// Enable the API log, default to false
    #[serde(default = "api::log")]
    pub log: bool,

    /// Socket address to bind the API, default to 0.0.0.0:8080
    #[serde(default = "api::bind")]
    pub bind: SocketAddr,

    /// Enable debug mode, default to true in debug build, false in release
    /// build
    #[serde(default = "api::debug")]
    pub debug: bool,

    /// API doc (OpenAPI spec and scalar) configuration
    #[serde(default)]
    pub doc: ApiDocConfig,
}

/// API doc (OpenAPI spec and scalar) configuration
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApiDocConfig {
    /// Enable the API doc, default to true
    #[serde(default = "enable")]
    pub enable: bool,

    /// Path the API doc lives, default to `/api-doc`
    #[serde(default = "api::doc::path")]
    pub path: Utf8PathBuf,
}

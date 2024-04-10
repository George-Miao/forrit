use std::{net::SocketAddr, num::NonZeroU32, sync::OnceLock, time::Duration};

use camino::{Utf8Path, Utf8PathBuf};
use figment::{
    providers::{Env, Format, Json, Toml, Yaml},
    Figment,
};
use serde::{Deserialize, Serialize};
use tracing::info;
use url::Url;

use crate::util::MapOrVec;

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
    #[serde(default = "default::resolver::tmdb_rate_limit")]
    pub tmdb_rate_limit: NonZeroU32,

    /// Index configuration
    #[serde(default)]
    pub index: IndexConfig,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IndexConfig {
    /// Enable the index, default to true
    #[serde(default = "default::enable")]
    pub enable: bool,

    /// Start indexing from the beginning, default to true
    #[serde(default = "default::resolver::index::start_at_begin")]
    pub start_at_begin: bool,

    /// Interval to update the index, default to 7 days
    #[serde(with = "humantime_serde", default = "default::resolver::index::interval")]
    pub interval: Duration,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DatabaseConfig {
    /// URL of the mongo database, default to `mongodb://localhost:27017`
    #[serde(default = "default::database::url")]
    pub url: String,

    /// Name of the database, default to `forrit`
    #[serde(default = "default::database::database")]
    pub database: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SourcerConfig {
    /// Enable the sourcer, default to true
    #[serde(default = "default::enable")]
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
    #[serde(with = "humantime_serde", default = "default::sourcer::rss::update_interval")]
    pub update_interval: Duration,

    /// Deny items with mime type other than `application/x-bittorrent`, default
    /// to false
    #[serde(default = "default::sourcer::rss::deny_non_torrent")]
    pub deny_non_torrent: bool,
}

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
    #[serde(default = "default::enable")]
    pub enable: bool,

    /// Interval to check and rename the downloaded torrent, default to 5
    /// minutes
    #[serde(with = "humantime_serde", default = "default::downloader::rename::interval")]
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
    #[serde(default = "default::downloader::transmission::url")]
    pub url: url::Url,

    #[serde(default, flatten)]
    pub auth: Option<Auth>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct QbittorrentConfig {
    /// Save path for the downloaded torrent, leave it empty to use the default
    #[serde(default)]
    pub savepath: Option<Utf8PathBuf>,

    /// URL of the qBittorrent API
    #[serde(default = "default::downloader::qbittorrent::url")]
    pub url: url::Url,

    #[serde(flatten)]
    pub auth: Auth,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApiConfig {
    /// Enable the API, default to true
    #[serde(default = "default::enable")]
    pub enable: bool,

    /// Socket address to bind the API, default to 0.0.0.0:8080
    #[serde(default = "default::api::bind")]
    pub bind: SocketAddr,

    /// Enable debug mode, default to true in debug build, false in release
    /// build
    #[serde(default = "default::api::debug")]
    pub debug: bool,
}

/// Default values for the configuration
mod default {
    pub fn enable() -> bool {
        true
    }
    pub mod resolver {
        use std::num::NonZeroU32;

        pub fn tmdb_rate_limit() -> NonZeroU32 {
            NonZeroU32::new(40).unwrap()
        }

        pub mod index {
            use std::time::Duration;

            use crate::config::{default::enable, IndexConfig};

            impl Default for IndexConfig {
                fn default() -> Self {
                    Self {
                        enable: enable(),
                        start_at_begin: start_at_begin(),
                        interval: interval(),
                    }
                }
            }

            pub fn start_at_begin() -> bool {
                true
            }

            pub fn interval() -> Duration {
                Duration::from_secs(7 * 24 * 60 * 60)
            }
        }
    }

    pub mod database {
        pub fn url() -> String {
            "mongodb://localhost:27017".to_owned()
        }

        pub fn database() -> String {
            "forrit".to_owned()
        }
    }

    pub mod sourcer {
        pub mod rss {
            use std::time::Duration;

            use crate::config::MINUTE;

            pub fn update_interval() -> Duration {
                5 * MINUTE
            }

            pub fn deny_non_torrent() -> bool {
                false
            }
        }
    }

    pub mod downloader {
        use crate::config::RenameConfig;

        pub mod rename {
            use std::time::Duration;

            use crate::config::MINUTE;

            pub fn interval() -> Duration {
                5 * MINUTE
            }
        }

        impl Default for RenameConfig {
            fn default() -> Self {
                RenameConfig {
                    enable: true,
                    interval: rename::interval(),
                    format: Default::default(),
                }
            }
        }

        pub mod transmission {
            pub fn url() -> url::Url {
                "http://localhost:9091/transmission/rpc".parse().expect("invalid url")
            }
        }

        pub mod qbittorrent {
            pub fn url() -> url::Url {
                "http://localhost:8080/".parse().expect("invalid url")
            }
        }
    }

    pub mod api {
        use std::net::SocketAddr;

        use crate::config::ApiConfig;

        impl Default for ApiConfig {
            fn default() -> Self {
                Self {
                    enable: super::enable(),
                    bind: bind(),
                    debug: debug(),
                }
            }
        }

        pub fn bind() -> SocketAddr {
            "0.0.0.0:8080".parse().expect("invalid address")
        }

        pub fn debug() -> bool {
            cfg!(debug_assertions)
        }
    }
}

use std::{
    net::IpAddr,
    path::{Path, PathBuf},
    sync::OnceLock,
    time::Duration,
};

use color_eyre::{eyre::eyre, Result};
use reqwest::Url;
use serde::Serialize;
use twelf::{config, Layer};

static CONF_PATH: OnceLock<PathBuf> = OnceLock::new();
static CONFIG: OnceLock<Config> = OnceLock::new();

pub fn init(path: impl Into<PathBuf>) -> Result<()> {
    CONF_PATH
        .set(path.into())
        .map_err(|_| eyre!("Config dir already set"))?;
    let config = Config::from_dir(
        CONF_PATH
            .get()
            .ok_or_else(|| eyre!("Config is not initialized"))?,
    )?;
    CONFIG
        .set(config)
        .map_err(|_| eyre!("Config already set"))?;
    // Ok(REQUIRE_RELOAD.clone())
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

    #[serde(default = "default::download_dir")]
    pub download_dir: PathBuf,

    #[serde(default = "default::transmission_url")]
    pub transmission_url: Url,

    #[serde(default)]
    pub transmission_auth: Option<(String, String)>,

    #[serde(default = "default::bangumi_domain")]
    pub bangumi_domain: String,

    #[serde(default)]
    pub dry_run: bool,

    #[serde(default = "default::check_intervel")]
    #[serde(with = "humantime_serde")]
    pub check_intervel: Duration,

    #[serde(default)]
    pub server: ServerConfig,
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

mod default {
    use std::{net::IpAddr, path::PathBuf};

    use bangumi::DEFAULT_DOMAIN;
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
    pub fn bangumi_domain() -> String {
        DEFAULT_DOMAIN.to_owned()
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
            download_dir: default::download_dir(),
            transmission_url: default::transmission_url(),
            transmission_auth: None,
            bangumi_domain: default::bangumi_domain(),
            dry_run: false,
            check_intervel: default::check_intervel(),
            server: ServerConfig::default(),
        }
    }
}

impl Config {
    pub fn from_dir(dir: impl Into<PathBuf>) -> Result<Self> {
        Config::with_layers(&[Layer::Toml(dir.into()), Layer::Env(Some("FORRIT_".into()))])
            .map_err(Into::into)
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

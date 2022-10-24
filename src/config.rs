use std::{path::PathBuf, sync::OnceLock, time::Duration};

use color_eyre::{eyre::eyre, Result};
use reqwest::Url;
use serde::Serialize;
use tap::Pipe;
use tokio::sync::{RwLock, RwLockReadGuard};
use toml_edit::{ArrayOfTables, Document, Item};
use tracing::info;
use twelf::{config, Layer};

use crate::{bangumi_moe::Id, Subscription};

static CONF_DIR: OnceLock<PathBuf> = OnceLock::new();
static CONFIG: RwLock<Option<Config>> = RwLock::const_new(None);

pub async fn load_config(path: impl Into<PathBuf>) -> Result<()> {
    CONF_DIR
        .set(path.into())
        .map_err(|_| eyre!("Config dir already set"))?;
    let config = Config::from_dir(CONF_DIR.get().unwrap())?;
    CONFIG.write().await.replace(config);
    Ok(())
}

pub async fn reload_config() -> Result<()> {
    let config = Config::from_dir(CONF_DIR.get().unwrap())?;
    CONFIG.write().await.replace(config);
    info!("Config reloaded");
    Ok(())
}

pub async fn get_config<'a>() -> RwLockReadGuard<'a, Config> {
    RwLockReadGuard::map(CONFIG.read().await, |x| x.as_ref().unwrap())
}

pub async fn update_config(actions: impl Iterator<Item = ConfigAction>) -> Result<()> {
    let current_content = CONF_DIR
        .get()
        .expect("Config dir not set")
        .pipe(tokio::fs::read_to_string)
        .await?
        .parse::<Document>()?;

    let mut config = CONFIG.write().await;

    Ok(())
}

#[derive(Debug, Clone)]
pub enum ConfigAction {
    AddSubscription(Subscription),
    RemoveSubscription(Id),
    UpdateSubscription(Id, Subscription),
    UpdateCheckIntervel(Duration),
}

impl ConfigAction {
    fn apply(self, doc: &mut Document) -> Result<()> {
        if !doc["subscriptions"].is_array() | !doc["subscriptions"].is_array() {
            doc["subscriptions"] = Item::ArrayOfTables(ArrayOfTables::new());
        }
        match self {
            Self::AddSubscription(sub) => {
                doc["subscriptions"]
                    .as_array_mut()
                    .or_else(|| doc["subscriptions"].as_array_of_tables_mut())
                    .unwrap_or_else(|| {
                        doc["subscriptions"] = Item::Value(toml_edit::Array::new().into());
                        doc["subscriptions"].as_array_mut().unwrap()
                    })
                    .push(toml_edit::ser::to_item(&sub)?.into_value()?);
            }
            Self::RemoveSubscription(id) => {
                doc["subscriptions"]
                    .as_array_mut()?
                    .unwrap()
                    .remove(id.to_string());
            }
            Self::UpdateSubscription(id, sub) => {
                let sub = sub.to_toml()?;
                doc["subscriptions"][id.to_string()] = sub;
            }
            Self::UpdateCheckIntervel(dur) => {
                doc["check_interval"] = dur.as_secs().into();
            }
        }
        Some(())
    }
}

#[config]
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

    #[serde(default)]
    pub subscription: Vec<Subscription>,

    #[serde(default = "default::bangumi_moe_domain")]
    pub bangumi_moe_domain: String,

    #[serde(default)]
    pub dry_run: bool,

    #[serde(default = "default::check_intervel")]
    #[serde(with = "humantime_serde")]
    pub check_intervel: Duration,
}

mod default {
    use std::path::PathBuf;

    use reqwest::Url;

    use crate::bangumi_moe::DEFAULT_DOMAIN;

    pub(super) fn data_dir() -> PathBuf {
        dirs::data_dir().unwrap().join("forrit")
    }
    pub(super) fn download_dir() -> PathBuf {
        dirs::download_dir().expect("unable to resolve download dir")
    }
    pub(super) fn transmission_url() -> Url {
        "http://localhost:9091/transmission/rpc".parse().unwrap()
    }
    pub(super) fn bangumi_moe_domain() -> String {
        DEFAULT_DOMAIN.to_owned()
    }
    pub(super) fn check_intervel() -> std::time::Duration {
        std::time::Duration::from_secs(60)
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            data_dir: default::data_dir(),
            download_dir: default::download_dir(),
            transmission_url: default::transmission_url(),
            transmission_auth: None,
            subscription: vec![],
            bangumi_moe_domain: default::bangumi_moe_domain(),
            dry_run: false,
            check_intervel: default::check_intervel(),
        }
    }
}

impl Config {
    pub fn from_dir(dir: impl Into<PathBuf>) -> Result<Self> {
        Config::with_layers(&[Layer::Toml(dir.into()), Layer::Env(Some("FORRIT_".into()))])
            .map_err(Into::into)
    }

    pub fn db_dir(&self) -> PathBuf {
        self.data_dir.join("forrit.db")
    }
}

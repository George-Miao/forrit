use std::path::PathBuf;

use reqwest::Url;
use serde::{Deserialize, Serialize};

use crate::model::Subscription;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub data_dir: PathBuf,
    pub download_dir: PathBuf,
    pub transmission_url: Url,
    pub transmission_auth: Option<(String, String)>,
    pub subs: Vec<Subscription>,
}

impl Default for Config {
    fn default() -> Self {
        let base = home::home_dir().unwrap();
        Self {
            data_dir: base.join(".config/forrit"),
            download_dir: base.join(".local/forrit"),
            transmission_url: "http://localhost:9091/transmission/rpc".parse().unwrap(),
            transmission_auth: None,
            subs: vec![],
        }
    }
}

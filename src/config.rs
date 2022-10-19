use std::path::PathBuf;

use crate::model::Subscription;

#[derive(Debug, Clone)]
pub struct Config {
    pub data_dir: PathBuf,
    pub download_dir: PathBuf,
    pub subs: Vec<Subscription>,
}

impl Default for Config {
    fn default() -> Self {
        let base = home::home_dir().unwrap();
        Self {
            data_dir: base.join(".config/forrit"),
            download_dir: base.join(".local/forrit"),
            subs: vec![],
        }
    }
}

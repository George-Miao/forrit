#![feature(type_alias_impl_trait)]

use std::{
    ops::Deref,
    path::{Path, PathBuf},
};

use clap::Parser;
use color_eyre::Result;
use serde::{Deserialize, Serialize};
use toml_edit::Document;
mod_use::mod_use![api, cli];

fn main() -> Result<()> {
    let conf = Config::default();
    color_eyre::install()?;
    let Err(e) = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(Arg::parse().run(conf)) else {
            return Ok(())
        };
    println!("{}", e);

    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedConfig {
    #[serde(default)]
    pub bangumi_domain: Option<String>,
    #[serde(default = "default::server")]
    pub server: String,
}

mod default {
    pub fn server() -> String {
        "http://localhost:9090".to_string()
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    parsed: ParsedConfig,
    path: PathBuf,
    pub orig: Document,
}

impl Config {
    pub async fn from_path(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref().to_owned();
        if !path.exists() {
            let this = Self {
                path,
                ..Self::default()
            };
            this.write_back().await?;
            Ok(this)
        } else {
            let orig: Document = tokio::fs::read_to_string(&path).await?.parse()?;
            let parsed = toml_edit::easy::from_document(orig.clone())?;
            Ok(Self { orig, parsed, path })
        }
    }

    pub async fn write_back(&self) -> Result<()> {
        let buf = self.orig.to_string();
        tokio::fs::write(&self.path, buf).await?;
        Ok(())
    }
}

impl Deref for Config {
    type Target = ParsedConfig;

    fn deref(&self) -> &Self::Target {
        &self.parsed
    }
}

impl Default for ParsedConfig {
    fn default() -> Self {
        toml_edit::easy::from_str("").expect("config has field without default value")
    }
}

impl Default for Config {
    fn default() -> Self {
        let parsed = ParsedConfig::default();
        let orig = toml_edit::easy::to_document(&parsed).unwrap();
        let path = dirs::config_dir()
            .expect("unable to find config dir")
            .join("forrit/config.toml");
        Self { parsed, path, orig }
    }
}

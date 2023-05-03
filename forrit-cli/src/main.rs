#![feature(type_alias_impl_trait)]
#![feature(iter_intersperse)]

use std::{
    env::var_os,
    io::Write,
    ops::{Deref, DerefMut},
    path::{Path, PathBuf},
    process::{exit, Command, Stdio},
};

use clap::Parser;
use color_eyre::Result;
use either::Either;
use owo_colors::OwoColorize;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tap::{Pipe, TapFallible};
use toml_edit::Document;
mod_use::mod_use![api, cli, ext];

#[test]
fn show_spinner() {
    use spinners::{Spinner, Spinners};
    use strum::IntoEnumIterator;

    for spin in Spinners::iter() {
        let name = format!("{} spinner", spin);
        let mut spinner = Spinner::new(spin, name);
        std::thread::sleep(std::time::Duration::from_secs(2));
        spinner.stop();
    }
}

fn main() -> Result<()> {
    color_eyre::install()?;

    match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let conf = Config::load().await?;
            Arg::parse().run(conf).await
        }) {
        Ok(()) => Ok(()),
        Err(e) => {
            eprintln!("{}", e.red());
            exit(-1);
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedConfig {
    #[serde(default = "default::bangumi")]
    pub bangumi: String,
    #[serde(default = "default::server")]
    pub server: String,
}

mod default {
    pub fn server() -> String {
        "http://localhost:9090".to_string()
    }
    pub fn bangumi() -> String {
        bangumi::DEFAULT_DOMAIN.to_string()
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    parsed: ParsedConfig,
    path: PathBuf,
    pub orig: Document,
}

impl Config {
    pub async fn load() -> Result<Self> {
        Self::from_path(
            dirs::config_dir()
                .ok_or_else(|| color_eyre::eyre::eyre!("Unable to find config dir"))?
                .join("forrit/config.toml"),
        )
        .await
    }

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

impl DerefMut for Config {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.parsed
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

fn pager(f: impl FnOnce(&mut dyn Write) -> std::io::Result<()>) -> Result<()> {
    /// Default pager environment variable
    const DEFAULT_PAGER_ENV: &str = "PAGER";

    /// Environment variable to disable pager altogether
    const NO_PAGER_ENV: &str = "NOPAGER";

    /// Last resort pager. Should work everywhere.
    const DEFAULT_PAGER: &str = "more";

    let mut pager = (|| {
        let pager = if var_os(NO_PAGER_ENV).is_some() {
            None
        } else {
            var_os(DEFAULT_PAGER_ENV)
                .unwrap_or_else(|| DEFAULT_PAGER.into())
                .pipe(Some)
        }?;

        Command::new(pager)
            .stdin(Stdio::piped())
            .spawn()
            .tap_err(|x| eprintln!("Failed to spawn pager: {}\n\nFalling back to stdout", x))
            .ok()
    })();

    let mut w = pager
        .as_mut()
        .and_then(|p| p.stdin.take())
        .map(Either::Left)
        .unwrap_or_else(|| std::io::stdout().lock().pipe(Either::Right));

    f(&mut w)?;

    drop(w);

    if let Some(pager) = &mut pager {
        pager.wait()?;
    }

    Ok(())
}
fn prettify_value<T: Serialize>(val: T, indent: usize) -> String {
    let val = serde_json::to_value(&val).unwrap();
    // let (n, _) = get_indent();
    let n = if let Some(obj) = val.as_object() {
        obj.keys().map(|x| x.len()).max().unwrap_or(15).max(15)
    } else {
        15
    };
    match val {
        Value::Null => "None".to_string(),
        Value::Bool(x) => format!("{}", x),
        Value::Number(x) => format!("{}", x),
        Value::String(x) => x,
        Value::Array(x) => x
            .into_iter()
            .map(|x| prettify_value(x, 0))
            .intersperse("\n  ".to_owned() + &" ".repeat(indent * n))
            .collect::<String>(),
        Value::Object(x) => format_obj(&x, n, indent),
    }
}

fn format_obj(obj: &Map<String, Value>, n: usize, indent: usize) -> String {
    if indent == 0 {
        obj.into_iter()
            .map(|(k, v)| format!("{:>1$} {2}", k.green(), n, prettify_value(v, 1)))
            .intersperse("\n".to_owned())
            .collect::<String>()
    } else {
        obj.into_iter()
            .map(|(k, v)| format!("{k} = {}", prettify_value(v, indent)))
            .intersperse("\n  ".to_owned() + &" ".repeat(indent * n))
            .collect::<String>()
    }
}

#[test]
fn pretty() {
    use serde_json::json;

    let s = json!({
        "nest": {
            "oops": 123,
            "hoho": [
                "123123",
                "123123",
                "aojdnoahdoaspodhoaosd"
            ]
        },
        "val": [
            {
                "hoho": "hoho"
            }
        ]
    });

    println!("{}", prettify_value(s, 0));
}

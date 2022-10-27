#![feature(never_type)]

use std::{env, path::PathBuf};

use color_eyre::Result;
use forrit::{init, Config, Forrit};
use tap::Tap;
use tokio::select;
use tracing::{info, metadata::LevelFilter};
use tracing_subscriber::{self as ts};
use ts::EnvFilter;

#[tokio::main]
async fn main() -> Result<()> {
    ts::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .with_env_var("FORRIT_LOG")
                .from_env_lossy()
                .add_directive("actix_server=warn".parse().unwrap()),
        )
        .init();
    color_eyre::install()?;

    let conf_path = env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            dirs::config_dir()
                .expect("Unable to find config dir")
                .join("forrit/config.toml")
                .tap(|dir| {
                    info!("Using default config path: {}", dir.display());
                })
        })
        .tap(|path| {
            info!("Using config path: {}", path.display());
        });

    if !conf_path.exists() {
        info!("Config file not found, creating a new one",);
        Config::default().save_to_path(&conf_path).await?;
    }

    init(conf_path)?;

    let forrit = Forrit::new().await?;

    select! {
        _ = forrit.main_loop() => {}
        res = forrit.spawn_server() => {
            res?;
        }
        res = tokio::signal::ctrl_c() => {
            info!("Ctrl-C received, exiting");
            res?;

        }
    }

    Ok(())
}

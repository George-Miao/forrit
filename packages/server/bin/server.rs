#![feature(try_blocks)]

use std::{process::exit, str::FromStr};

use camino::Utf8PathBuf;
use forrit_config::init_config;
use forrit_server::{util::Boom, *};
use tap::Conv;
use tracing::{error, info, level_filters::LevelFilter};
use tracing_subscriber::{Layer, filter::Targets, layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), ractor::SpawnErr> {
    let level = std::env::var("FORRIT_LOG")
        .ok()
        .map(|s| LevelFilter::from_str(&s).boom("Invalid log level"))
        .unwrap_or_else(|| LevelFilter::INFO);

    let target_filter = Targets::new()
        .with_default(level)
        .with_target("forrit_server::resolver::index", LevelFilter::INFO)
        .with_target("forrit_server::db", LevelFilter::DEBUG)
        .with_target("hyper", LevelFilter::INFO)
        .with_target("rustls", LevelFilter::WARN);

    let fmt = tracing_subscriber::fmt::layer()
        .without_time()
        .with_filter(target_filter);
    tracing_subscriber::registry().with(fmt).init();

    let path = get_path_from_args().or_else(get_path_from_env);
    let config = init_config(path.as_ref()).boom("Failed to load config");

    Forrit::new(config).await.boom("Failed to start Forrit").run().await
}

fn get_path_from_args() -> Option<Utf8PathBuf> {
    let mut args = std::env::args();
    let exe = args.next()?;
    let path = args.next()?.conv::<Utf8PathBuf>();
    if !path.exists() {
        error!(?path, "Config file does not exist. ");
        info!("Usage: {exe} <config file path>");
        exit(1)
    }
    Some(path)
}

fn get_path_from_env() -> Option<Utf8PathBuf> {
    std::env::var("FORRIT_CONFIG").ok().map(|s| s.conv::<Utf8PathBuf>())
}

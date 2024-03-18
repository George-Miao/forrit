#![allow(clippy::large_enum_variant)]
#![feature(lazy_cell, let_chains, try_blocks)]

use std::{process::exit, sync::LazyLock, time::Duration};

use camino::Utf8PathBuf;
use mongodb::Client;
use tap::Conv;
use tracing::{error, info, level_filters::LevelFilter};

use crate::{
    config::{get_config, init_config},
    util::Boom,
};

mod api;
mod config;
mod db;
mod downloader;
mod notifier;
mod resolver;
mod sourcer;
mod subscription;
mod util;

//
#[cfg(test)]
mod test;

const RPC_TIMEOUT: Duration = Duration::from_secs(3);

const ACTOR_ERR: &str = "Actor is not running or registered";
const SEND_ERR: &str = "Failed to send message to actor";
const RECV_ERR: &str = "Failed to receive response from actor";

static REQ: LazyLock<reqwest::Client> = LazyLock::new(reqwest::Client::new);

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .without_time()
        .with_max_level(LevelFilter::INFO)
        .init();

    let path: Option<Utf8PathBuf> = try {
        let mut args = std::env::args();
        let exe = args.next()?;
        let path = args.next()?.conv::<Utf8PathBuf>();
        if !path.exists() {
            error!("Config file does not exist. ");
            info!("Usage: {exe} <config file path>");
            exit(1)
        }
        path
    };

    init_config(path);
    let config = get_config();

    let mongo = Client::with_uri_str(&config.database.url)
        .await
        .boom("Failed to connect to database");
    let db = mongo.database(&config.database.database);

    resolver::start(&db).await;
    downloader::start(&db).await;
    sourcer::start(&db).await;
    subscription::start(&db).await;

    api::run().await;
}

#![feature(try_blocks)]

use std::{process::exit, str::FromStr};

use camino::Utf8PathBuf;
use forrit_config::init_config;
use forrit_server::{db::Collections, util::Boom, *};
use futures::future::join4;
use mongodb::Client;
use tap::Conv;
use tracing::{error, info, level_filters::LevelFilter};
use tracing_subscriber::{filter::Targets, layer::SubscriberExt, util::SubscriberInitExt, Layer};

#[tokio::main]
async fn main() {
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

    let path: Option<Utf8PathBuf> = try {
        let mut args = std::env::args();
        let exe = args.next()?;
        let path = args.next()?.conv::<Utf8PathBuf>();
        if !path.exists() {
            error!(?path, "Config file does not exist. ");
            info!("Usage: {exe} <config file path>");
            exit(1)
        }
        path
    };

    let config = init_config(path).boom("Failed to load config");

    let mongo = Client::with_uri_str(&config.database.url)
        .await
        .boom("Failed to connect to database");
    let db = mongo.database(&config.database.database);
    let col = Collections::new(&db).await.boom("Database error");

    join4(
        resolver::start(&col),
        downloader::start(&col),
        sourcer::start(&col),
        dispatcher::start(&col),
    )
    .await;

    api::run(col).await;
}

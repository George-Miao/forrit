#![feature(let_chains, once_cell, duration_constants, default_free_fn)]

#[macro_use]
extern crate tracing;

use std::{borrow::Cow, sync::LazyLock};

use color_eyre::{eyre::eyre, Result};
use reqwest::Client;
use tracing::metadata::LevelFilter;
use tracing_subscriber::EnvFilter;

mod_use::mod_use![source, download, notify, config, server, util];

pub static HTTP_CLIENT: LazyLock<Client> = LazyLock::new(Client::new);
pub static BANGUMI_CLIENT: LazyLock<bangumi::rustify::Client> =
    LazyLock::new(|| bangumi::rustify::Client::new(bangumi::DEFAULT_DOMAIN, HTTP_CLIENT.clone()));

#[tokio::main]
async fn main() {
    color_eyre::install().unwrap();

    run().await.unwrap();
}

async fn run() -> Result<()> {
    tracing_subscriber::fmt::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .with_env_var("FORRIT_LOG")
                .from_env_lossy(),
        )
        .without_time()
        .try_init()
        .map_err(|_| eyre!("Failed to initialize tracing"))?;

    let conf_path = {
        let mut iter = std::env::args();
        let prog = iter.next().map(Cow::from).unwrap_or("forrit-ractor".into());
        iter.next()
            .ok_or_else(|| eyre!("Usage: {prog} <config path>"))?
    };

    init(conf_path).await?;

    let config = get_config();

    let database = {
        let c = mongodb::Client::with_uri_str(&config.database.url).await?;
        c.list_databases(None, None).await?;
        info!("Database connected");
        c.database(&config.database.database_name)
    };

    download::DownloadCluster::new(config.downloader.clone())
        .spawn()
        .await?;
    let read = database.collection(&config.database.subscription_collection_name);
    let update = database.collection(&config.database.subscription_collection_name);
    let torrents = database.collection(&config.database.torrent_collection_name);
    let (src, _) = source::SourceCluster::new(read.clone(), torrents)
        .spawn()
        .await?;

    tokio::select! {
        _ = server::start(read, update) => {}
        _ = src.send_interval(config.check_intervel, || SourceMessage::Update) => {}
        _ = tokio::signal::ctrl_c() => {}
    }
    Ok(())
}

#![feature(let_chains, lazy_cell, duration_constants, default_free_fn)]

#[macro_use]
extern crate tracing;

use std::{borrow::Cow, sync::LazyLock};

use color_eyre::{eyre::eyre, Result};
use reqwest::Client;
use tracing::metadata::LevelFilter;
use tracing_subscriber::EnvFilter;

mod_use::mod_use![source, download, notify, config, server, util];

pub static HTTP_CLIENT: LazyLock<Client> = LazyLock::new(Client::new);
pub static BANGUMI_CLIENT: LazyLock<bangumi::rustified::Client> =
    LazyLock::new(|| bangumi::rustified::Client::new(bangumi::DEFAULT_DOMAIN, HTTP_CLIENT.clone()));

#[tokio::main]
async fn main() -> Result<()> {
    color_eyre::install().unwrap();

    run().await
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

    match config.downloader.clone() {
        DownloadersConfig::Qbittorrent(config) => {
            QbitCluster::new(config).spawn().await?;
        }
        DownloadersConfig::Transmission(config) => {
            TransmissionCluster::new(config).spawn().await?;
        }
    }

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

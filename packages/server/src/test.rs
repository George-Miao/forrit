#![cfg(test)]

use std::num::NonZeroU32;

use figment::Jail;
use forrit_config::init_config;
use futures::Future;
use governor::{Quota, RateLimiter};
use mongodb::{Client, Database};
use tokio::sync::OnceCell;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{filter::Targets, layer::SubscriberExt, util::SubscriberInitExt, Layer};

use crate::{db::Collections, resolver::Resolver, util::GovernedClient, REQ};

pub struct Env {
    pub db: Database,
    pub col: Collections,
    pub resolver: Resolver,
}

pub fn run<F, Fut>(func: F)
where
    F: FnOnce(&'static Env) -> Fut,
    Fut: Future,
{
    static ENV: OnceCell<Env> = OnceCell::const_new();
    dotenvy::dotenv().ok();

    Jail::expect_with(|j| {
        tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .unwrap()
            .block_on(async {
                let env = ENV.get_or_init(|| prepare(j)).await;
                // let clean = var("NO_CLEAN").is_err();
                // let db = env.db.clone();
                func(env).await;
                // if clean {
                //     info!("Clean Up");
                //     db.drop(None).await.unwrap();
                // }
            });
        Ok(())
    })
}

async fn prepare(jail: &mut Jail) -> Env {
    let path = "config.toml";
    jail.create_file(
        path,
        r#"
        [resolver.index]
        enable = false

        [sourcer.acg-rip]
        type            = "rss"
        url             = "https://acg.rip/1.xml"
        update_interval = "30s"

        [downloader]
        type     = "qbittorrent"

        [downloader.rename]
        enable = false
    "#,
    )
    .unwrap();

    let config = init_config(Some(path)).unwrap();

    let fmt_layer = tracing_subscriber::fmt::layer().without_time().with_filter(
        Targets::new()
            .with_default(LevelFilter::INFO)
            .with_target("forrit_server::resolver", LevelFilter::DEBUG)
            .with_target("rustls", LevelFilter::OFF),
    );

    tracing_subscriber::registry().with(fmt_layer).init();

    let mongo = Client::with_uri_str(&config.database.url).await.unwrap();
    let db = mongo.database("test");
    let client = GovernedClient::new(
        tmdb_api::Client::builder()
            .with_api_key(config.resolver.tmdb_api_key.to_owned())
            .with_base_url("https://api.themoviedb.org/3")
            .with_reqwest_client(REQ.clone())
            .build()
            .unwrap(),
        RateLimiter::direct(Quota::per_second(NonZeroU32::new(20).unwrap())),
    );
    let col = Collections::new(&db).await.unwrap();
    let resolver = Resolver::new(client, col.meta.clone(), col.alias.clone(), &config.resolver);

    Env { db, col, resolver }
}

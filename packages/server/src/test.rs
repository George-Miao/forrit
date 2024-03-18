use std::{num::NonZeroU32, sync::Arc};

use dotenvy::var;
use figment::Jail;
use futures::Future;
use governor::{DefaultDirectRateLimiter, Quota, RateLimiter};
use mongodb::{Client, Database};
use tap::Pipe;
use tokio::sync::OnceCell;
use tracing::level_filters::LevelFilter;
use tracing_subscriber::{filter::Targets, layer::SubscriberExt, util::SubscriberInitExt, Layer};

use crate::{
    config::{get_config, init_config},
    resolver::{MetaStorage, Resolver},
    util::GovernedClient,
    REQ,
};

pub struct Env {
    pub db: Database,
    pub resolver: Resolver,
    pub governor: Arc<DefaultDirectRateLimiter>,
}

pub fn run<F, Fut>(func: F)
where
    F: FnOnce(&'static Env) -> Fut,
    Fut: Future,
{
    static ENV: OnceCell<Env> = OnceCell::const_new();
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
    dotenvy::dotenv().ok();

    let path = "config.toml";
    jail.create_file(path, "").unwrap();
    init_config(Some(path));

    let target_filter = Targets::new()
        .with_default(LevelFilter::INFO)
        .with_target("forrit_server::resolver", LevelFilter::DEBUG)
        .with_target("rustls", LevelFilter::OFF);
    tracing_subscriber::fmt::layer()
        .without_time()
        .with_filter(target_filter)
        .pipe(|x| tracing_subscriber::registry().with(x))
        .init();

    let db_url = var("DATABASE_URL").expect("DATABASE_URL not set");
    let api_key = var("TMDB_API_KEY").expect("TMDB_API_KEY not set");

    let mongo = Client::with_uri_str(db_url).await.unwrap();
    let db = mongo.database("test");
    let governor: Arc<DefaultDirectRateLimiter> =
        RateLimiter::direct(Quota::per_second(NonZeroU32::new(20).unwrap())).into();
    let client = GovernedClient::new(
        tmdb_api::Client::builder()
            .with_api_key(api_key)
            .with_base_url("https://api.themoviedb.org/3")
            .with_reqwest_client(REQ.clone())
            .build()
            .unwrap(),
        governor.clone(),
    );
    let meta = MetaStorage::new(db.collection("meta"));
    meta.create_indexes().await.unwrap();
    let config = &get_config().resolver;
    let resolver = Resolver::new(client, meta, db.collection("aliases"), config).await;

    Env { db, resolver, governor }
}

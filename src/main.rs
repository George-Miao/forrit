// use async_compat::CompatExt;
use color_eyre::Result;
use forrit_core::{bangumi::Id, Subscription, WithID};
use rustify::{Client, Endpoint, };
use rustify_derive::Endpoint;
use serde::{Deserialize, Serialize};

fn main() -> Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(run())
}

async fn run() -> Result<()> {
    let c = Client::default("http://127.0.0.1:9090");

    let sub = Subscription {
        bangumi: Id("62c125b82fc3ee0d0016bf68".to_string()),
        tags: vec![],
        season: None,
        include_pattern: None,
        exclude_pattern: None,
    };

    let req = PostSub { sub };
    let res = req.exec(&c).await?.parse()?;
    println!("{res:#?}");

    Ok(())
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(path = "/subscription", response = "Vec<Subscription>")]
struct ListSub {}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/subscription",
    method = "POST",
    response = "WithID<String, Subscription>"
)]
struct PostSub {
    #[endpoint(body)]
    #[serde(flatten)]
    sub: Subscription,
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/subscription/{self.id}",
    method = "PUT",
    response = "PutResult"
)]
struct PutSub {
    #[endpoint(skip)]
    id: String,
    sub: Subscription,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "status", content = "content", rename_all = "lowercase")]
enum PutResult {
    Updated(Subscription),
    Created(Subscription),
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/subscription/{self.id}",
    method = "DELETE",
    response = "Subscription"
)]
struct DeleteSub {
    id: String,
}

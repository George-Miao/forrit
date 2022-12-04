use forrit_core::{BangumiSubscription, Confirm, WithId};
use rustify_derive::Endpoint;
use serde::{Deserialize, Serialize};
use typed_builder::TypedBuilder;

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(
    path = "/subscription",
    response = "Vec<WithId<String, BangumiSubscription>>"
)]
pub struct ListSub {}

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(
    path = "/subscription",
    method = "POST",
    response = "WithId<String, BangumiSubscription>"
)]
pub struct PostSub {
    #[endpoint(body)]
    #[serde(flatten)]
    sub: BangumiSubscription,
}

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(
    path = "/subscription/{self.id}",
    method = "PUT",
    response = "PutResult"
)]
pub struct PutSub {
    #[endpoint(skip)]
    id: String,
    sub: BangumiSubscription,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "status", content = "content", rename_all = "lowercase")]
pub enum PutResult {
    Updated(BangumiSubscription),
    Created(BangumiSubscription),
}

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(path = "/subscription/{self.id}", method = "DELETE")]
pub struct DeleteSub {
    id: String,
}

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(path = "/subscription", method = "DELETE", response = "Confirm")]
pub struct DeleteSubs {
    #[endpoint(body)]
    ids: Vec<String>,
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(path = "/config", response = "serde_json::Value")]
pub struct GetConfig;

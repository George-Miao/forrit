use forrit_core::model::{Job, ListParam, ListResult, WithId};
use mongodb::bson::doc;
use salvo::{oapi::endpoint, prelude::*};
use tap::Pipe;

use crate::{
    api::{ApiResult, OidParam},
    db::Storage,
    downloader::JobIdx,
};

/// Create a new download job for an entry
#[endpoint]
async fn new_download(entry_id: OidParam) -> ApiResult<Json<Option<WithId<Job>>>> {
    super::download_entry(entry_id.id).await.pipe(Json).pipe(Ok)
}

/// List all downloads generated by a subscription
#[endpoint]
async fn list_downloads(pod: &Depot, id: OidParam, param: ListParam) -> ApiResult<Json<ListResult<WithId<Job>>>> {
    pod.obtain::<Storage<Job>>()
        .expect("missing Storage<Download>")
        .list_by(doc! { JobIdx::SUBSCRIPTION_ID : id.id }, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

pub fn dispatcher_api() -> Router {
    Router::new().push(Router::with_path("entry").push(Router::with_path("<id>/download").post(new_download)))
}

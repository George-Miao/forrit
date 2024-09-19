use forrit_core::model::{Job, WithId};
use mongodb::bson::doc;
use salvo::{oapi::endpoint, prelude::*};
use tap::Pipe;

use crate::{
    api::{ApiResult, CrudResultExt, OidParam},
    db::Storage,
    sourcer::EntryStorage,
};

/// Create a new download job for an entry
#[endpoint]
async fn new_download(pod: &mut Depot, entry_id: OidParam) -> ApiResult<Json<WithId<Job>>> {
    let entry = pod
        .obtain::<EntryStorage>()
        .expect("missing EntryStorage")
        .get_one(entry_id.id)
        .await
        .unwrap_not_found("entry")?;
    super::download_entry(entry).await.pipe(Json).pipe(Ok)
}

#[endpoint]
async fn get_download(pod: &mut Depot, id: OidParam) -> ApiResult<Json<Vec<WithId<Job>>>> {
    pod.obtain::<Storage<Job>>()
        .expect("missing Storage<Job>")
        .get_by_entry(id.id)
        .await
        .map(Json)
        .map_err(Into::into)
}

pub fn dispatcher_api() -> Router {
    Router::new().push(
        Router::with_path("entry/<id>/download")
            .get(get_download)
            .post(new_download),
    )
}

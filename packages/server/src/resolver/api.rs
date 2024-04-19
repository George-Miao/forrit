use forrit_core::{
    date::{Season, YearSeason},
    model::{Alias, IndexArg, IndexStat, ListParam, ListResult, Meta, PartialEntry, WithId},
};
use salvo::{
    oapi::extract::{JsonBody, QueryParam},
    prelude::*,
    websocket::Message,
};
use tap::Pipe;

use crate::{
    api::{ApiResult, OidParam},
    resolver::AliasKV,
    sourcer::EntryStorage,
};

/// Subscribe to index status updates
#[endpoint(tags("index"))]
async fn subscribe(req: &mut Request, res: &mut Response) -> Result<(), StatusError> {
    WebSocketUpgrade::new()
        .upgrade(req, res, |mut ws| async move {
            let Some(mut job) = super::get_index().await else {
                ws.close().await.ok();
                return;
            };
            while let Ok(index) = job.wait().await {
                if ws
                    .send(Message::text(serde_json::to_string(&index).unwrap()))
                    .await
                    .is_err()
                {
                    break;
                }
                if index.end_at.is_some() {
                    break;
                }
            }
            ws.close().await.ok();
        })
        .await
}

/// Get current index status
///
/// This API returns `null` if no index job is running
#[endpoint(tags("index"))]
async fn get_index() -> Json<Option<IndexStat>> {
    Json(try { super::get_index().await?.snapshot() })
}

/// Start new index job if none is running
#[endpoint(tags("index"))]
async fn start_index(arg: JsonBody<IndexArg>) -> StatusCode {
    super::start_index(arg.into_inner()).await;
    StatusCode::NO_CONTENT
}

/// Stop current index job immediately if there's one running
#[endpoint(tags("index"))]
async fn stop_index() -> StatusCode {
    super::stop_index();
    StatusCode::NO_CONTENT
}

/// Get all meta by season
#[endpoint(tags("meta"))]
async fn by_season(year: QueryParam<i32, false>, season: QueryParam<Season, false>) -> Json<Vec<WithId<Meta>>> {
    let param = try { YearSeason::new(year.into_inner()?, season.into_inner()?) };
    super::get_by_season(param).await.pipe(Json)
}

/// Get all entries of a meta
#[endpoint(tags("meta"))]
async fn get_entry(
    pod: &mut Depot,
    id: OidParam,
    param: ListParam,
) -> ApiResult<Json<ListResult<WithId<PartialEntry>>>> {
    pod.obtain::<EntryStorage>()
        .expect("missing EntryStorage")
        .list_by_meta_id(id.id, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

/// Get all aliases of a meta
#[endpoint(tags("meta"))]
async fn get_alias(pod: &mut Depot, id: OidParam, param: ListParam) -> ApiResult<Json<ListResult<WithId<Alias>>>> {
    pod.obtain::<AliasKV>()
        .expect("missing AliasKV")
        .list_keys_by_value(&id.id, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

pub fn resolver_api() -> Router {
    Router::new()
        .push(Router::with_path("meta/season").get(by_season))
        .push(Router::with_path("meta/<id>/entry").get(get_entry))
        .push(Router::with_path("meta/<id>/alias").get(get_alias))
        .push(
            Router::with_path("index")
                .get(get_index)
                .post(start_index)
                .delete(stop_index)
                .push(Router::with_path("subscribe").goal(subscribe)),
        )
}

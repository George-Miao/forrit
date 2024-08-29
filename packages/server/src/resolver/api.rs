use forrit_core::{
    date::{Season, YearSeason},
    model::{Alias, Download, IndexArg, IndexStat, ListParam, ListResult, Meta, PartialEntry, Subscription, WithId},
};
use mongodb::bson::doc;
use salvo::{
    oapi::extract::{JsonBody, QueryParam},
    prelude::*,
    websocket::Message,
};
use tap::Pipe;

use crate::{
    api::{ApiResult, OidParam},
    db::Storage,
    dispatcher::SubscriptionIdx,
    downloader::DownloadIdx,
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
async fn start_index(arg: JsonBody<IndexArg>) {
    super::start_index(arg.into_inner()).await;
}

/// Stop current index job immediately if there's one running
#[endpoint(tags("index"))]
async fn stop_index() {
    super::stop_index();
}

/// Get all meta by season
#[endpoint(tags("meta"))]
async fn by_season(year: QueryParam<i32, false>, season: QueryParam<Season, false>) -> Json<Vec<WithId<Meta>>> {
    let param = try { YearSeason::new(year.into_inner()?, season.into_inner()?) };
    super::get_by_season(param).await.pipe(Json)
}

/// Get all entries of a meta
#[endpoint(tags("meta"))]
async fn list_entry(
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
async fn list_alias(pod: &mut Depot, id: OidParam, param: ListParam) -> ApiResult<Json<ListResult<WithId<Alias>>>> {
    pod.obtain::<AliasKV>()
        .expect("missing AliasKV")
        .list_keys_by_value(&id.id, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

/// Get all subscriptions of a meta
#[endpoint(tags("meta"))]
async fn list_subscription(
    pod: &mut Depot,
    id: OidParam,
    param: ListParam,
) -> ApiResult<Json<ListResult<WithId<Subscription>>>> {
    pod.obtain::<Storage<Subscription>>()
        .expect("missing AliasKV")
        .list_by(doc! { SubscriptionIdx::META_ID: id.id }, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

#[endpoint]
async fn list_download(pod: &Depot, id: OidParam, param: ListParam) -> ApiResult<Json<ListResult<WithId<Download>>>> {
    pod.obtain::<Storage<Download>>()
        .expect("missing GetSet<Download>")
        .list_by(doc! { DownloadIdx::META_ID : id.id }, param)
        .await?
        .pipe(Json)
        .pipe(Ok)
}

pub fn resolver_api() -> Router {
    Router::new()
        .push(
            Router::with_path("meta")
                .push(Router::with_path("season").get(by_season))
                .push(Router::with_path("<id>/entry").get(list_entry))
                .push(Router::with_path("<id>/alias").get(list_alias))
                .push(Router::with_path("<id>/download").get(list_download))
                .push(Router::with_path("<id>/subscription").get(list_subscription)),
        )
        .push(
            Router::with_path("index")
                .get(get_index)
                .post(start_index)
                .delete(stop_index)
                .push(Router::with_path("subscribe").goal(subscribe)),
        )
}

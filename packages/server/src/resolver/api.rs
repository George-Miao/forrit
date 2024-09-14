use forrit_core::{
    date::{Season, YearSeason},
    model::{
        Alias, IndexArg, IndexStat, Job, ListParam, ListResult, Meta, PartialEntry, Subscription, UpdateResult, WithId,
    },
};
use mongodb::bson::{doc, to_bson};
use salvo::{
    oapi::extract::{JsonBody, QueryParam},
    prelude::*,
    websocket::Message,
};
use tap::Pipe;

use crate::{
    api::{ApiResult, CrudResultExt, OidParam},
    db::{CrudError, Storage},
    dispatcher::refresh_subscription,
    downloader::JobIdx,
    resolver::{AliasKV, MetaStorage},
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

/// Get all group of a meta
#[endpoint(tags("meta"))]
async fn list_groups(pod: &mut Depot, id: OidParam) -> ApiResult<Json<Vec<String>>> {
    pod.obtain::<EntryStorage>()
        .expect("missing EntryStorage")
        .list_groups_of_meta(id.id)
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

/// Get subscription of a meta
#[endpoint(tags("meta"))]
async fn get_subscription(pod: &mut Depot, id: OidParam) -> ApiResult<Json<Option<Subscription>>> {
    pod.obtain::<MetaStorage>()
        .expect("missing MetaStorage")
        .get_by_oid(id.id)
        .await
        .map_err(CrudError::from)
        .unwrap_not_found("meta")?
        .inner
        .subscription
        .pipe(Json)
        .pipe(Ok)
}

/// Update subscription of a meta
#[endpoint(tags("meta"))]
async fn update_subscription(
    pod: &mut Depot,
    id: OidParam,
    obj: JsonBody<Subscription>,
) -> ApiResult<Json<UpdateResult>> {
    let res = pod
        .obtain::<MetaStorage>()
        .expect("missing MetaStorage")
        .set
        .update_one(
            doc! { "_id": id.id },
            doc! { "$set": { "subscription": to_bson(&obj.0)? }},
            None,
        )
        .await?;
    let updated = res.modified_count != 0;
    if updated {
        refresh_subscription(id.id);
    }
    Ok(Json(UpdateResult { updated }))
}

/// Delete subscription of a meta
#[endpoint(tags("meta"))]
async fn delete_subscription(pod: &mut Depot, id: OidParam) -> ApiResult<Json<UpdateResult>> {
    let res = pod
        .obtain::<MetaStorage>()
        .expect("missing MetaStorage")
        .set
        .update_one(doc! { "_id": id.id }, doc! { "$set": { "subscription": null }}, None)
        .await?;
    Ok(Json(UpdateResult {
        updated: res.modified_count != 0,
    }))
}

#[endpoint]
async fn list_download(pod: &Depot, id: OidParam, param: ListParam) -> ApiResult<Json<ListResult<WithId<Job>>>> {
    pod.obtain::<Storage<Job>>()
        .expect("missing GetSet<Download>")
        .list_by(doc! { JobIdx::META_ID : id.id }, param)
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
                .push(Router::with_path("<id>/group").get(list_groups))
                .push(Router::with_path("<id>/alias").get(list_alias))
                .push(Router::with_path("<id>/download").get(list_download))
                .push(
                    Router::with_path("<id>/subscription")
                        .get(get_subscription)
                        .put(update_subscription)
                        .delete(delete_subscription),
                ),
        )
        .push(
            Router::with_path("index")
                .get(get_index)
                .post(start_index)
                .delete(stop_index)
                .push(Router::with_path("subscribe").goal(subscribe)),
        )
}

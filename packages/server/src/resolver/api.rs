use forrit_core::{
    date::{Season, YearSeason},
    model::{
        Alias, EntryGroup, IndexArg, IndexStat, Job, ListParam, ListResult, Meta, PartialEntry, SubscribeGroups,
        Subscription, UpdateResult, WithId,
    },
};
use mongodb::bson::{doc, to_bson};
use regex::Regex;
use salvo::{
    oapi::extract::{JsonBody, QueryParam},
    prelude::*,
    websocket::Message,
};
use tap::Pipe;

use crate::{
    api::{ApiError, ApiResult, CrudResultExt, OidParam},
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

/// Get all subscribed meta
#[endpoint(tags("meta"))]
async fn list_subscriptions(
    year: QueryParam<i32, false>,
    season: QueryParam<Season, false>,
) -> Json<Vec<WithId<Meta>>> {
    let selected = try { YearSeason::new(year.into_inner()?, season.into_inner()?) };
    super::get_by_season(selected)
        .await
        .into_iter()
        .filter(|meta| meta.inner.subscription.is_some())
        .collect::<Vec<_>>()
        .pipe(Json)
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
async fn list_groups(pod: &mut Depot, id: OidParam) -> ApiResult<Json<Vec<EntryGroup>>> {
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
    validate_subscription(&obj.0)?;
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

fn validate_subscription(subscription: &Subscription) -> ApiResult<()> {
    for (name, pattern) in [("include", &subscription.include), ("exclude", &subscription.exclude)] {
        if let Some(pattern) = pattern {
            Regex::new(pattern).map_err(|error| ApiError::InvalidRequest {
                reason: format!("invalid {name} regex: {error}"),
            })?;
        }
    }

    if let Some(directory) = &subscription.directory
        && directory.as_str().trim().is_empty()
    {
        return Err(ApiError::InvalidRequest {
            reason: "directory must not be empty".to_owned(),
        });
    }

    if let (Some(min), Some(max)) = (subscription.min_size, subscription.max_size)
        && min > max
    {
        return Err(ApiError::InvalidRequest {
            reason: "min_size must not exceed max_size".to_owned(),
        });
    }

    if let SubscribeGroups::Groups(groups) = &subscription.groups {
        let mut unique = std::collections::HashSet::with_capacity(groups.len());
        for group in groups {
            if group.trim().is_empty() {
                return Err(ApiError::InvalidRequest {
                    reason: "subscription group names must not be empty".to_owned(),
                });
            }
            if !unique.insert(group) {
                return Err(ApiError::InvalidRequest {
                    reason: format!("duplicate subscription group: {group}"),
                });
            }
        }
    }

    let has_groups = match &subscription.groups {
        SubscribeGroups::All => true,
        SubscribeGroups::Groups(groups) => !groups.is_empty(),
    };
    if !has_groups
        && subscription.directory.is_none()
        && subscription.include.is_none()
        && subscription.exclude.is_none()
        && subscription.min_size.is_none()
        && subscription.max_size.is_none()
    {
        return Err(ApiError::InvalidRequest {
            reason: "subscription must contain at least one setting".to_owned(),
        });
    }

    Ok(())
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
                .push(Router::with_path("subscription").get(list_subscriptions))
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

#[cfg(test)]
mod tests {
    use forrit_core::model::{SubscribeGroups, Subscription};

    use super::validate_subscription;

    fn subscription() -> Subscription {
        Subscription {
            directory: None,
            groups: SubscribeGroups::All,
            include: None,
            exclude: None,
            min_size: None,
            max_size: None,
        }
    }

    #[test]
    fn accepts_valid_subscription() {
        let mut subscription = subscription();
        subscription.include = Some(r"1080p|2160p".to_owned());
        subscription.exclude = Some(r"\bCAM\b".to_owned());
        subscription.min_size = Some(100);
        subscription.max_size = Some(200);

        validate_subscription(&subscription).expect("subscription should be valid");
    }

    #[test]
    fn rejects_invalid_subscription_regex() {
        let mut subscription = subscription();
        subscription.exclude = Some("[".to_owned());

        let error = validate_subscription(&subscription).expect_err("regex should be rejected");
        assert!(error.to_string().contains("invalid exclude regex"));
    }

    #[test]
    fn rejects_invalid_subscription_settings() {
        let mut subscription = subscription();
        subscription.min_size = Some(200);
        subscription.max_size = Some(100);
        assert!(validate_subscription(&subscription).is_err());

        subscription.min_size = None;
        subscription.max_size = None;
        subscription.groups = SubscribeGroups::Groups(vec!["group".to_owned(), "group".to_owned()]);
        assert!(validate_subscription(&subscription).is_err());

        subscription.groups = SubscribeGroups::Groups(vec![" ".to_owned()]);
        assert!(validate_subscription(&subscription).is_err());

        subscription.groups = SubscribeGroups::Groups(Vec::new());
        assert!(validate_subscription(&subscription).is_err());
    }
}

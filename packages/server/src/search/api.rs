use salvo::{
    Writer,
    oapi::extract::QueryParam,
    prelude::{Depot, Json, Router, endpoint},
};

use super::{Search, SearchEntryPage, SearchResult, SearchSection, store::SearchError};
use crate::api::{ApiError, ApiResult, OidParam};

fn obtain(depot: &Depot) -> &Search {
    depot.obtain::<Search>().expect("missing Search")
}

fn map_error(error: SearchError) -> ApiError {
    match error {
        SearchError::Query(error) => ApiError::InvalidRequest {
            reason: error.to_string(),
        },
        SearchError::InvalidCursor => ApiError::InvalidCursor,
        SearchError::Database(error) => ApiError::DatabaseError(error),
        SearchError::Decode(error) => ApiError::InternalError(error.to_string()),
    }
}

#[endpoint(operation_id = "search_suggestions", tags("search"))]
async fn suggestions(depot: &Depot, q: QueryParam<String, true>) -> ApiResult<Json<SearchResult>> {
    obtain(depot)
        .suggestions(&q.into_inner())
        .await
        .map(Json)
        .map_err(map_error)
}

#[endpoint(operation_id = "search", tags("search"))]
async fn search_all(
    depot: &Depot,
    q: QueryParam<String, true>,
    section: QueryParam<SearchSection, false>,
    cursor: QueryParam<String, false>,
) -> ApiResult<Json<SearchResult>> {
    obtain(depot)
        .search(&q.into_inner(), section.into_inner(), cursor.as_deref())
        .await
        .map(Json)
        .map_err(map_error)
}

#[endpoint(operation_id = "search_meta_entries", tags("search"))]
async fn meta_entries(
    depot: &Depot,
    id: OidParam,
    q: QueryParam<String, true>,
    cursor: QueryParam<String, false>,
) -> ApiResult<Json<SearchEntryPage>> {
    let engine = obtain(depot);
    if !engine.has_meta(id.id).await.map_err(map_error)? {
        return Err(ApiError::DoesNotExist {
            resource: "metadata".into(),
        });
    }
    engine
        .entries(id.id, &q.into_inner(), cursor.as_deref())
        .await
        .map(Json)
        .map_err(map_error)
}

pub fn search_api() -> Router {
    Router::with_path("search")
        .get(search_all)
        .push(Router::with_path("suggestions").get(suggestions))
        .push(Router::with_path("meta/<id>/entry").get(meta_entries))
}

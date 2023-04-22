use std::{net::SocketAddr, str::FromStr};

use color_eyre::Result;
use forrit_core::{futures::TryStreamExt, BangumiSubscription};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::ReturnDocument,
    Collection,
};
use poem::{
    error::ResponseError,
    get, handler,
    http::StatusCode,
    listener::TcpListener,
    middleware::Tracing,
    web::{Data, Json, Path},
    EndpointExt, IntoResponse, Route, Server,
};
use serde::{Deserialize, Serialize};
use serde_with::DeserializeFromStr;
use tap::Pipe;

use crate::{get_config, source, validate, Id, WithId};

type Read<'a> = Data<&'a Collection<WithId<BangumiSubscription>>>;
type Write<'a> = Data<&'a Collection<BangumiSubscription>>;

pub async fn start(
    read: Collection<WithId<BangumiSubscription>>,
    update: Collection<BangumiSubscription>,
) -> Result<()> {
    let config = &get_config().server;

    SocketAddr::new(config.bind, config.port)
        .pipe(TcpListener::bind)
        .pipe(Server::new)
        .run(
            Route::new()
                .at(
                    "/subscription",
                    get(subscription::list)
                        .post(subscription::create)
                        .delete(subscription::delete_many),
                )
                .at(
                    "/subscription/:id",
                    get(subscription::read)
                        .put(subscription::update)
                        .delete(subscription::delete),
                )
                .at("/config", get(config::get))
                .with(Tracing)
                .data(read)
                .data(update),
        )
        .await
        .map_err(Into::into)
}

mod config {
    use super::*;

    #[handler]
    pub async fn get() -> impl IntoResponse {
        crate::get_config().pipe(Json)
    }
}

mod subscription {
    use mongodb::options::FindOneAndUpdateOptions;

    use super::*;

    #[derive(Debug, Clone, PartialEq, PartialOrd, Eq, Ord, Hash, Serialize, Deserialize)]
    pub struct Ids {
        ids: Vec<Id>,
    }

    #[derive(Debug, Clone, PartialEq, PartialOrd, Eq, Ord, Hash, Serialize, DeserializeFromStr)]
    pub struct IdParam(Id);

    impl FromStr for IdParam {
        type Err = ApiError;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            ObjectId::from_str(s)
                .map_err(|_| ApiError::InvalidSubscription)
                .map(Id)
                .map(IdParam)
        }
    }

    #[handler]
    pub async fn list(Data(col): Read<'_>) -> ApiResult<impl IntoResponse> {
        col.find(None, None)
            .await?
            .try_collect::<Vec<_>>()
            .await
            .map(Json)
            .map_err(Into::into)
    }

    #[handler]
    pub async fn create(
        Data(col): Write<'_>,
        Json(sub): Json<BangumiSubscription>,
    ) -> ApiResult<impl IntoResponse> {
        if !validate(&sub).await? {
            return Err(ApiError::InvalidSubscription);
        }

        let id = col.insert_one(&sub, None).await?.inserted_id;

        source::update();

        Ok(Json(WithId {
            id: Id(id.as_object_id().unwrap()),
            inner: sub,
        }))
    }

    #[handler]
    pub async fn read(
        Data(col): Read<'_>,
        Path(IdParam(id)): Path<IdParam>,
    ) -> ApiResult<impl IntoResponse> {
        col.find_one(doc! { "_id": id.0 }, None)
            .await?
            .ok_or_else(|| ApiError::SubscriptionNotFound(id))
            .map(Json)
    }

    #[handler]
    pub async fn update(
        Data(col): Write<'_>,
        Path(IdParam(id)): Path<IdParam>,
        Json(sub): Json<BangumiSubscription>,
    ) -> ApiResult<impl IntoResponse> {
        if !validate(&sub).await? {
            return Err(ApiError::InvalidSubscription);
        }
        #[derive(Serialize)]
        #[serde(rename_all = "lowercase")]
        enum UpdateResult {
            Updated,
            // Unable to determine if the document was created or updated with mongo. Keep here
            // for compatibility.
            #[allow(dead_code)]
            Created,
        }
        #[derive(Serialize)]
        struct UpdateReturn {
            result: UpdateResult,
            content: BangumiSubscription,
        }

        source::update();

        col.find_one_and_update(
            doc! { "_id": id.0 },
            doc! { "$set": mongodb::bson::to_bson(&sub)? },
            FindOneAndUpdateOptions::builder()
                .return_document(ReturnDocument::Before)
                .upsert(true)
                .build(),
        )
        .await?
        .unwrap_or(sub)
        .pipe(|content| UpdateReturn {
            result: UpdateResult::Updated,
            content,
        })
        .pipe(Json)
        .pipe(Ok)
    }

    #[handler]
    pub async fn delete(
        Data(col): Read<'_>,
        Path(IdParam(id)): Path<IdParam>,
    ) -> ApiResult<impl IntoResponse> {
        col.find_one_and_delete(doc! { "_id": id.0 }, None)
            .await?
            .map(Json)
            .ok_or_else(|| ApiError::SubscriptionNotFound(id))
    }

    #[handler]
    pub async fn delete_many(
        Data(col): Read<'_>,
        Json(Ids { ids }): Json<Ids>,
    ) -> ApiResult<impl IntoResponse> {
        let ids = ids.into_iter().map(|id| id.0).collect::<Vec<_>>();

        let deleted = col
            .delete_many(
                doc! { "_id": {
                    "$in": ids
                } },
                None,
            )
            .await?
            .deleted_count;

        Ok(Json(deleted))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Invalid subscription")]
    InvalidSubscription,

    #[error("Subscription ID not found: {0}")]
    SubscriptionNotFound(Id),

    #[error("Database error: {0}")]
    MongoDBError(#[from] mongodb::error::Error),

    #[error("Bson error: {0}")]
    BsonError(#[from] mongodb::bson::ser::Error),

    #[error("Client error: {0}")]
    ClientError(#[from] bangumi::rustified::errors::ClientError),
}

impl ApiError {
    pub fn is_internal(&self) -> bool {
        matches!(self, ApiError::MongoDBError(_) | ApiError::ClientError(_))
    }
}

impl ResponseError for ApiError {
    fn status(&self) -> StatusCode {
        match self {
            ApiError::InvalidSubscription => StatusCode::BAD_REQUEST,
            ApiError::SubscriptionNotFound(_) => StatusCode::NOT_FOUND,
            ApiError::MongoDBError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::ClientError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::BsonError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn as_response(&self) -> poem::Response
    where
        Self: std::error::Error + Send + Sync + 'static,
    {
        let status = self.status();
        poem::Response::builder().status(status).body(
            status
                .is_server_error()
                .then(|| {
                    warn!(error = %self);
                    "Server Error".into()
                })
                .unwrap_or_else(|| self.to_string()),
        )
    }
}

type ApiResult<T, E = ApiError> = Result<T, E>;

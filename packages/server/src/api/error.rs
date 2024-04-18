use std::borrow::Cow;

use humantime::Duration;
use mongodb_cursor_pagination::CursorError;
use salvo::{
    oapi::{self},
    prelude::*,
};
use thiserror::Error;
use tracing::warn;

use crate::db::{CrudError, CrudResult};

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("{resource} not found")]
    DoesNotExist { resource: Cow<'static, str> },

    #[error("Database error: {0}")]
    DatabaseError(#[from] mongodb::error::Error),

    #[error("Invalid cursor")]
    InvalidCursor,

    #[error("Internal service error: {0}")]
    InternalError(String),

    #[error("Internal service time out (limit: {limit})")]
    Timeout { limit: Duration },
}

impl EndpointOutRegister for ApiError {
    fn register(components: &mut oapi::Components, operation: &mut oapi::Operation) {
        operation.responses.append(&mut Self::to_responses(components))
    }
}

impl ToResponses for ApiError {
    fn to_responses(components: &mut oapi::Components) -> oapi::Responses {
        let mut responses = oapi::Responses::new();
        let errors = vec![
            StatusError::not_found(),
            StatusError::request_timeout(),
            StatusError::internal_server_error(),
        ];
        for StatusError { code, brief, .. } in errors {
            responses.insert(
                code.as_str(),
                oapi::Response::new(brief).add_content(
                    "application/json",
                    oapi::Content::new(StatusError::to_schema(components)),
                ),
            )
        }
        responses
    }
}
impl ApiError {
    pub fn status(&self) -> StatusCode {
        match self {
            ApiError::DoesNotExist { .. } => StatusCode::NOT_FOUND,
            ApiError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Timeout { .. } => StatusCode::REQUEST_TIMEOUT,
            ApiError::InvalidCursor => StatusCode::BAD_REQUEST,
        }
    }

    pub fn is_internal(&self) -> bool {
        matches!(self, ApiError::DatabaseError(_) | ApiError::InternalError(_))
    }

    pub fn brief(&self, debug: bool) -> Cow<'static, str> {
        if !debug && self.is_internal() {
            "API internal error".into()
        } else {
            self.to_string().into()
        }
    }
}

#[async_trait]
impl Writer for ApiError {
    async fn write(self, _: &mut Request, depot: &mut Depot, res: &mut Response) {
        let debug = depot.get::<bool>("debug").copied().unwrap_or_else(|_| {
            warn!("Debug hoop not working");
            false
        });
        StatusError::from_code(self.status())
            .expect("this is an error")
            .brief(self.brief(debug))
            .cause(self)
            .render(res)
    }
}

impl From<CrudError> for ApiError {
    fn from(crud: CrudError) -> Self {
        match crud {
            CrudError::DatabaseError(db) => ApiError::DatabaseError(db),
            CrudError::CursorError(e) => match e {
                CursorError::BsonDeError(e) => ApiError::InternalError(e.to_string()),
                CursorError::BsonSerError(e) => ApiError::InternalError(e.to_string()),
                CursorError::BsonValueAccessError(e) => ApiError::InternalError(e.to_string()),
                CursorError::ParseError(e) => ApiError::InternalError(e.to_string()),
                CursorError::MongoDBError(e) => ApiError::DatabaseError(e),
                CursorError::InvalidCursor => ApiError::InvalidCursor,
            },
            CrudError::Timeout { limit } => ApiError::Timeout { limit: limit.into() },
        }
    }
}

pub type ApiResult<T, E = ApiError> = Result<T, E>;

pub trait CrudResultExt {
    type T;
    fn unwrap_not_found(self, resource: impl Into<Cow<'static, str>>) -> ApiResult<Self::T>;
}

impl<T> CrudResultExt for CrudResult<Option<T>> {
    type T = T;

    fn unwrap_not_found(self, resource: impl Into<Cow<'static, str>>) -> ApiResult<T> {
        self?.ok_or_else(|| ApiError::DoesNotExist {
            resource: resource.into(),
        })
    }
}

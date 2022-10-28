use std::ops::Deref;

use actix_web::{
    delete,
    error::InternalError,
    get,
    middleware::{Logger, NormalizePath},
    post, put,
    web::{Data, Json, Path, Query},
    App, Either, FromRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_httpauth::{
    extractors::AuthenticationError, headers::www_authenticate::basic::Basic,
    middleware::HttpAuthentication,
};
use bangumi::{Api, Id};
use color_eyre::Result;
use forrit_core::with;
use futures::{
    future::{ready, try_join, Ready},
    StreamExt, TryStreamExt,
};
use reqwest::StatusCode;
use serde::Deserialize;
use serde_json::json;
use tap::Pipe;
use tracing::{info, warn};

use crate::{get_config, Config, Forrit, IntoStream, SerdeTree, Subscription};

type Subs = Data<SerdeTree<Subscription>>;

impl Forrit {
    pub async fn server(&self) -> Result<()> {
        let config = get_config().clone();
        let bind = (config.server.bind, config.server.port);
        let num_workers = config.server.workers;

        let subs = Data::new(self.subs.clone());
        let conf = Data::new(config);
        let api = Data::new(self.api.clone());

        info!("Staring server");

        HttpServer::new(move || {
            let _auth = HttpAuthentication::basic(|req, auth| async move {
                let conf = req.app_data::<Data<Config>>().unwrap();
                if let Some((username, password)) = &conf.server.auth {
                    if auth.user_id() != username || auth.password() != Some(password.as_str()) {
                        return Err((AuthenticationError::new(Basic::new()).into(), req));
                    }
                }
                Ok(req)
            });
            App::new()
                .app_data(conf.clone())
                .app_data(subs.clone())
                .app_data(api.clone())
                .wrap(Logger::default())
                .wrap(NormalizePath::trim())
                .service(list_subs)
                .service(get_sub)
                .service(add_sub)
                .service(update_sub)
                .service(delete_sub)
        })
        .workers(num_workers)
        .bind(bind)?
        .run()
        .await
        .map_err(From::from)
    }
}

#[get("/subscription")]
async fn list_subs(db: Subs) -> actix_web::Result<impl Responder> {
    let res = db
        .iter_with_id()
        .collect::<Result<Vec<_>>>()
        .into_internal()?;
    Ok(Json(res))
}

#[get("/subscription/{id}")]
async fn get_sub(db: Subs, id: Path<String>) -> actix_web::Result<impl Responder> {
    db.get(id.as_str())
        .into_internal()
        .map(|x| match x {
            Some(x) => Json(x).pipe(Either::Left),
            None => HttpResponse::NotFound().pipe(Either::Right),
        })?
        .pipe(Ok)
}

#[post("/subscription")]
async fn add_sub(
    api: Data<Api>,
    db: Subs,
    Json(sub): Json<Subscription>,
) -> actix_web::Result<impl Responder> {
    validate_sub(&api, &sub).await?;

    let id = db.insert(&sub).into_internal()?;
    Ok(Json(with!(id, content = sub)))
}

#[put("/subscription/{id}")]
async fn update_sub(
    api: Data<Api>,
    db: Subs,
    id: Path<String>,
    Json(sub): Json<Subscription>,
) -> actix_web::Result<impl Responder> {
    validate_sub(&api, &sub).await?;

    match db.upsert(id.into_inner(), &sub).into_internal()? {
        Some(res) => Ok(Either::Left(Json(json!({
            "result": "updated",
            "content": res,
        })))),
        None => Ok(Either::Right(Json(json!({
            "result": "created",
            "content": sub,
        })))),
    }
}

#[delete("/subscription/{id}")]
async fn delete_sub(db: Subs, id: Path<String>) -> actix_web::Result<impl Responder> {
    match db.remove(id.into_inner()).into_internal()? {
        Some(res) => Ok(Either::Left(Json(res))),
        None => Ok(Either::Right(HttpResponse::NotFound())),
    }
}

trait ErrorConvert<T, E> {
    fn into_internal(self) -> Result<T, InternalError<E>>;
    fn into_internal_with<C>(self, cause: C, code: StatusCode) -> Result<T, InternalError<C>>;
}

impl<T> ErrorConvert<T, &'static str> for color_eyre::Result<T> {
    fn into_internal(self) -> Result<T, InternalError<&'static str>> {
        self.map_err(|error| {
            warn!(%error);
            InternalError::new("Internal Error", StatusCode::INTERNAL_SERVER_ERROR)
        })
    }

    fn into_internal_with<C>(self, cause: C, code: StatusCode) -> Result<T, InternalError<C>> {
        self.map_err(|error| {
            warn!(%error);
            InternalError::new(cause, code)
        })
    }
}

impl<T> ErrorConvert<T, &'static str> for bangumi::Result<T> {
    fn into_internal(self) -> Result<T, InternalError<&'static str>> {
        self.map_err(|error| {
            warn!(%error);
            InternalError::new("Internal Error", StatusCode::INTERNAL_SERVER_ERROR)
        })
    }

    fn into_internal_with<C>(self, cause: C, code: StatusCode) -> Result<T, InternalError<C>> {
        self.map_err(|error| {
            warn!(%error);
            InternalError::new(cause, code)
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Tags(pub Vec<Id>);

impl FromRequest for Tags {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        #[derive(Debug, Deserialize)]
        struct TagsQuery {
            tags: String,
        }

        ready(Ok(Query::<TagsQuery>::from_request(req, payload)
            .into_inner()
            .map(|query| Tags(query.tags.split('+').map(|x| Id(x.to_string())).collect()))
            .unwrap_or_else(|_| Tags(vec![]))))
    }
}

impl Tags {
    pub fn as_set(&self) -> std::collections::HashSet<&Id> {
        self.0.iter().collect()
    }
}

pub async fn validate_sub(api: &Api, sub: &Subscription) -> Result<(), actix_web::Error> {
    let fut1 = async {
        api.fetch_tag(sub.bangumi.as_str())
            .await
            .into_internal_with(
                format!("Invalid bangumi tag `{}`", sub.bangumi.as_str()),
                StatusCode::BAD_REQUEST,
            )
    };
    let fut2 = {
        sub.tags
            .deref()
            .into_stream()
            .then(|tag| async {
                api.fetch_tag(tag.as_str()).await.into_internal_with(
                    format!("Invalid filter tag `{}`", tag.as_str()),
                    StatusCode::BAD_REQUEST,
                )
            })
            .try_collect::<Vec<_>>()
    };
    try_join(fut1, fut2).await?;
    Ok(())
}

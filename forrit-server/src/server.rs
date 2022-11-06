use std::time::Duration;

use actix_web::{
    error::InternalError,
    middleware::{Logger, NormalizePath},
    web::*,
    App, Either, FromRequest, HttpResponse, HttpServer,
};
use actix_web_httpauth::{
    extractors::AuthenticationError, headers::www_authenticate::basic::Basic,
    middleware::HttpAuthentication,
};
use bangumi::Id;
use color_eyre::{eyre::eyre, Report, Result};
use forrit_core::{with, Confirm, Site};
use futures::future::{ready, Ready};
use reqwest::{StatusCode, Url};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_json::json;
use tap::{Pipe, Tap};
use tracing::{info, warn};

use crate::{get_config, BangumiSubscription, Config, Flag, Forrit, SerdeTree};

type Subs = SerdeTree<BangumiSubscription>;
type Recs = SerdeTree<Url>;

impl<S, D> Forrit<S, D>
where
    D: Send + 'static,
    S: Site + Clone + Send + Sync + 'static,
    S::Sub: Send + Serialize + DeserializeOwned,
    S::Error: Send + Sync,
{
    pub async fn server(&self) -> Result<()> {
        let config = get_config().clone();
        let bind = (config.server.bind, config.server.port);
        let num_workers = config.server.workers;

        let subs = self.subs.clone();
        let records = self.records.clone();
        let conf = Data::new(config);
        let site = Data::new(self.site.clone());
        let flag = self.flag.clone();

        info!("Staring server");

        let handle_list_subs = |db: SerdeTree<S::Sub>| async move {
            let res = db
                .iter_with_id()
                .collect::<Result<Vec<_>>>()
                .into_internal()?;
            actix_web::Result::<_>::Ok(Json(res))
        };

        let handle_post_sub = |api: Data<S>,
                               db: SerdeTree<S::Sub>,
                               waker: Flag,
                               Json(sub): Json<S::Sub>| async move {
            api.validate(&sub)
                .await
                .map_err(|e| eyre!(e))
                .into_internal()?;

            let id = db.insert(&sub).into_internal()?;
            waker.signal();
            actix_web::Result::<_>::Ok(Json(with!(id, content = sub)))
        };

        let handle_get_sub = |db: Subs, id: Path<String>| async move {
            db.get(id.as_str())
                .into_internal()
                .map(|x| match x {
                    Some(x) => Json(x).pipe(Either::Left),
                    None => HttpResponse::NotFound().pipe(Either::Right),
                })?
                .pipe(actix_web::Result::<_>::Ok)
        };

        let handle_put_sub = |api: Data<S>,
                              db: SerdeTree<S::Sub>,
                              waker: Data<Flag>,
                              id: Path<String>,
                              records: Recs,
                              Json(sub): Json<S::Sub>| async move {
            api.validate(&sub)
                .await
                .map_err(|e| eyre!(e))
                .into_internal()?;

            let id = id.into_inner();
            match db
                .upsert(&id, &sub)
                .into_internal()?
                .tap(|_| waker.signal())
            {
                Some(res) => {
                    records.remove_all(&id).into_internal()?;
                    actix_web::Result::<_>::Ok(Either::Left(Json(json!({
                        "result": "updated",
                        "content": res,
                    }))))
                }
                None => actix_web::Result::<_>::Ok(Either::Right(Json(json!({
                    "result": "created",
                    "content": sub,
                })))),
            }
        };

        let handle_delete_sub = |db: Subs, records: Recs, id: Path<String>| async move {
            let id = id.into_inner();
            match db.remove(&id).into_internal()? {
                Some(res) => {
                    records.remove_all(&id).into_internal()?;
                    actix_web::Result::<_>::Ok(Either::Left(Json(res)))
                }
                None => actix_web::Result::<_>::Ok(Either::Right(HttpResponse::NotFound())),
            }
        };

        let handle_delete_subs = |db: Subs, records: Recs, req: Json<DelSubs>| async move {
            let ids = req.into_inner().ids;
            db.remove_batch(ids.iter()).into_internal()?;
            ids.iter()
                .try_for_each(|id| records.remove_all(id).into_internal())?;
            actix_web::Result::<_>::Ok(Json(Confirm::default()))
        };

        let handle_get_config =
            |db: Data<Config>| async move { actix_web::Result::<_>::Ok(Json(db)) };

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
                .app_data(records.clone())
                .app_data(flag.clone())
                .app_data(site.clone())
                .wrap(Logger::default())
                .wrap(NormalizePath::trim())
                .service(
                    resource("/subscription")
                        .route(get().to(handle_list_subs))
                        .route(post().to(handle_post_sub))
                        .route(delete().to(handle_delete_subs)),
                )
                .service(
                    resource("/subscription/{id}")
                        .route(get().to(handle_get_sub))
                        .route(put().to(handle_put_sub))
                        .route(delete().to(handle_delete_sub)),
                )
                .service(resource("/config").route(get().to(handle_get_config)))
        })
        .workers(num_workers)
        .keep_alive(Duration::from_secs(90))
        .bind(bind)?
        .run()
        .await
        .map_err(From::from)
    }
}

#[derive(Debug, Deserialize)]
struct DelSubs {
    pub ids: Vec<String>,
}

trait ErrorConvert<T, E> {
    fn into_internal(self) -> Result<T, InternalError<E>>;
    fn into_internal_with<C>(self, cause: C, code: StatusCode) -> Result<T, InternalError<C>>;
}

impl<T> ErrorConvert<T, &'static str> for color_eyre::Result<T, Report> {
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

impl<T> ErrorConvert<T, &'static str> for Result<T, bangumi::Error> {
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

impl<T> ErrorConvert<T, &'static str> for Result<T, bangumi::rustify::errors::ClientError> {
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

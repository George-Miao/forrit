use forrit_config::get_config;
use forrit_core::model::{Job, Subscription};
use mongodb::bson::oid::ObjectId;
use salvo::{
    cors::{Any, Cors},
    prelude::*,
};
use tracing::info;

use crate::{
    db::{Collections, GetSet},
    resolver::{resolver_api, AliasKV, MetaStorage},
    sourcer::EntryStorage,
};

mod crud;
pub use crud::*;
mod error;
pub use error::*;

struct DebugHoop {
    debug: bool,
}

#[async_trait]
impl Handler for DebugHoop {
    async fn handle(&self, _: &mut Request, depot: &mut Depot, _: &mut Response, _: &mut FlowCtrl) {
        depot.insert("debug", self.debug);
    }
}

pub async fn run(col: Collections) {
    let config = &get_config().api;
    if !config.enable {
        return;
    }
    if config.debug {
        info!("Debug mode enabled, this may leak sensitive information and should be disabled in production.");
    };

    let cors = Cors::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .into_handler();

    let entry_api = build_crud!(EntryStorage, "entry",).without_create(col.entry);
    let meta_api = build_crud!(MetaStorage, "meta",).list().read().update().build(col.meta);
    let alias_api = build_crud!(AliasKV, "alias").all(col.alias);
    let sub_api = build_crud!(GetSet<Subscription>, "subscription",).all(col.subscription);
    let job_api = build_crud!(GetSet<Job>, "job",).list().read().build(col.job);

    let router = Router::new()
        .push(resolver_api())
        .push(entry_api)
        .push(meta_api)
        .push(alias_api)
        .push(sub_api)
        .push(job_api);

    let doc = OpenApi::new("Forrit api", "0.1.0").merge_router(&router);
    let router = router
        .push(doc.into_router("/api-doc/openapi.json"))
        .push(Scalar::new("/api-doc/openapi.json").into_router("scalar"));

    let service = Service::new(router)
        .hoop(cors)
        .hoop(Logger::new())
        .hoop(DebugHoop { debug: config.debug });
    let acceptor = TcpListener::new(config.bind).bind().await;
    Server::new(acceptor).serve(service).await;
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, ToParameters)]
#[salvo(extract(default_source(from = "param")))]
pub struct OidParam {
    #[salvo(parameter(parameter_in = Path, value_type = forrit_core::model::ObjectIdSchema))]
    pub id: ObjectId,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, ToParameters)]
pub struct CursorParam {
    #[salvo(parameter(parameter_in = Query, nullable, value_type = Option<String>))]
    pub forward: Option<mongodb_cursor_pagination::Edge>,

    #[salvo(parameter(parameter_in = Query, nullable, value_type = Option<String>))]
    pub backwards: Option<mongodb_cursor_pagination::Edge>,
}

// macro_rules! build_crud {
//     ($msg:ty, $tag:literal, $resource:ty $(,$timeout:expr)?) => {{
//         use salvo::{oapi::extract::*, prelude::*};
//         use tap::Pipe;
//         use forrit_core::model::{WithId, UpdateResult, ListResult};
//         use mongodb_cursor_pagination::DirectedCursor;

//         use crate::{
//             api::{ApiResult, CrudResultExt, OidParam},
//             db::{CrudCall, FromCrud},
//         };

//         type T = $resource;
//         const ACTOR_NAME: &str = <$msg as FromCrud<T>>::ACTOR_NAME;

//         #[endpoint(operation_id = concat!("list_", $tag),tags($tag))]
//         #[doc = concat!("List ", $tag)]
//         async fn list(param: CursorParam) ->
// ApiResult<Json<ListResult<WithId<T>>>> {             let param = if let
// Some(forward) = param.forward {
// Some(DirectedCursor::Forward(forward))             } else if let
// Some(backwards) = param.backwards {
// Some(DirectedCursor::Backwards(backwards))             } else {
//                 None
//             };
//             CrudCall::<T, $msg>::new(ACTOR_NAME)
//                 $(.timeout(Some($timeout)))?
//                 .list(param)
//                 .await?
//                 .pipe(Json)
//                 .pipe(Ok)
//         }

//         #[endpoint(operation_id = concat!("create_", $tag), tags($tag))]
//         #[doc = concat!("Create a new ", $tag)]
//         async fn post(obj: JsonBody<T>) -> ApiResult<String> {
//             CrudCall::<T, $msg>::new(ACTOR_NAME)
//                 $(.timeout(Some($timeout)))?
//                 .create(obj.0)
//                 .await?
//                 .to_hex()
//                 .pipe(Ok)
//         }

//         #[endpoint(operation_id = concat!("get_", $tag, "_by_id"),
// tags($tag))]         #[doc = concat!("Create ", $tag, " by id")]
//         async fn get(id: OidParam) -> ApiResult<Json<WithId<T>>> {
//             CrudCall::<T, $msg>::new(ACTOR_NAME)
//                 $(.timeout(Some($timeout)))?
//                 .get(id.id)
//                 .await
//                 .unwrap_not_found(ACTOR_NAME)?
//                 .pipe(Json)
//                 .pipe(Ok)
//         }

//         #[endpoint(operation_id = concat!("update_", $tag, "_by_id"),
// tags($tag))]         #[doc = concat!("Update ", $tag, " by id")]
//         async fn put(id: OidParam, obj: JsonBody<T>) ->
// ApiResult<Json<UpdateResult>> {             CrudCall::<T,
// $msg>::new(ACTOR_NAME)                 $(.timeout(Some($timeout)))?
//                 .update(id.id, obj.0)
//                 .await?
//                 .pipe(|updated| Json(UpdateResult { updated }))
//                 .pipe(Ok)
//         }

//         #[endpoint(operation_id = concat!("delete_", $tag, "_by_id"),
// tags($tag))]         #[doc = concat!("Delete ", $tag, " by id")]
//         async fn delete(id: OidParam) -> ApiResult<Json<WithId<T>>> {
//             CrudCall::<T, $msg>::new(ACTOR_NAME)
//                 $(.timeout(Some($timeout)))?
//                 .delete(id.id)
//                 .await
//                 .unwrap_not_found(ACTOR_NAME)?
//                 .pipe(Json)
//                 .pipe(Ok)
//         }

//         crate::api::CrudRouterBuilder::<T, $msg, _, _, _, _, _>::new(list,
// post, get, put, delete)     }};
// }

// pub(crate) use build_crud;

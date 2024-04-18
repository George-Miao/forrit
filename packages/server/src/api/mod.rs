use forrit_config::get_config;
use forrit_core::model::{Alias, Job, Meta, PartialEntry, Subscription};
use mongodb::bson::oid::ObjectId;
use salvo::{
    cors::{Any, Cors},
    prelude::*,
};
use tracing::info;

use crate::{
    db::FromCrud,
    resolver::{self, resolver_api},
    sourcer, subscription, RPC_TIMEOUT,
};

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

pub async fn run() {
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

    // TODO: Server log

    let entry_api = build_crud!(sourcer::EntryMessage, "entry", PartialEntry, RPC_TIMEOUT).without_create();
    let meta_api = build_crud!(resolver::Message, "meta", Meta, RPC_TIMEOUT)
        .list()
        .read()
        .update()
        .build();
    let alias_api = build_crud!(resolver::Message, "alias", Alias, RPC_TIMEOUT).all();
    let sub_api = build_crud!(subscription::Message, "subscription", Subscription, RPC_TIMEOUT).all();
    let job_api = build_crud!(subscription::Message, "job", Job, RPC_TIMEOUT)
        .list()
        .read()
        .build();

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
#[salvo(extract(default_source(from = "param")))]
pub struct CursorParam {
    #[salvo(parameter(parameter_in = Path, nullable, value_type = forrit_core::model::DirectedCursor))]
    pub cursor: Option<mongodb_cursor_pagination::DirectedCursor>,
}

macro_rules! build_crud {
    ($msg:ty, $tag:literal, $resource:ty $(,$timeout:expr)?) => {{
        use salvo::{oapi::extract::*, prelude::*};
        use tap::Pipe;
        use forrit_core::model::{WithId, UpdateResult, ListResult};

        use crate::{
            api::{ApiResult, CrudResultExt, OidParam},
            db::{CrudCall, FromCrud},
        };

        type T = $resource;
        const ACTOR_NAME: &str = <$msg as FromCrud<T>>::ACTOR_NAME;

        #[endpoint(operation_id = concat!("list_", $tag),tags($tag))]
        #[doc = concat!("List ", $tag)]
        async fn list(param: CursorParam) -> ApiResult<Json<ListResult<WithId<T>>>> {
            CrudCall::<T, $msg>::new(ACTOR_NAME)
                $(.timeout(Some($timeout)))?
                .list(param.cursor)
                .await?
                .pipe(Json)
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("create_", $tag), tags($tag))]
        #[doc = concat!("Create a new ", $tag)]
        async fn post(obj: JsonBody<T>) -> ApiResult<String> {
            CrudCall::<T, $msg>::new(ACTOR_NAME)
                $(.timeout(Some($timeout)))?
                .create(obj.0)
                .await?
                .to_hex()
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("get_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Create ", $tag, " by id")]
        async fn get(id: OidParam) -> ApiResult<Json<WithId<T>>> {
            CrudCall::<T, $msg>::new(ACTOR_NAME)
                $(.timeout(Some($timeout)))?
                .get(id.id)
                .await
                .unwrap_not_found(ACTOR_NAME)?
                .pipe(Json)
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("update_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Update ", $tag, " by id")]
        async fn put(id: OidParam, obj: JsonBody<T>) -> ApiResult<Json<UpdateResult>> {
            CrudCall::<T, $msg>::new(ACTOR_NAME)
                $(.timeout(Some($timeout)))?
                .update(id.id, obj.0)
                .await?
                .pipe(|updated| Json(UpdateResult { updated }))
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("delete_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Delete ", $tag, " by id")]
        async fn delete(id: OidParam) -> ApiResult<Json<WithId<T>>> {
            CrudCall::<T, $msg>::new(ACTOR_NAME)
                $(.timeout(Some($timeout)))?
                .delete(id.id)
                .await
                .unwrap_not_found(ACTOR_NAME)?
                .pipe(Json)
                .pipe(Ok)
        }


        crate::api::CrudRouterBuilder::<T, $msg, _, _, _, _, _>::new(list, post, get, put, delete)
    }};
}

pub(crate) use build_crud;

pub struct CrudRouterBuilder<Re, M, L, C, R, U, D> {
    router: Router,
    id_router: Router,
    list: L,
    create: C,
    read: R,
    update: U,
    delete: D,
    _p: std::marker::PhantomData<(Re, M)>,
}

impl<Re, M, L, C, R, U, D> CrudRouterBuilder<Re, M, L, C, R, U, D>
where
    M: FromCrud<Re>,
{
    pub fn new(list: L, create: C, read: R, update: U, delete: D) -> Self {
        Self {
            router: Router::with_path(M::RESOURCE_NAME),
            id_router: Router::with_path("<id>"),
            list,
            create,
            read,
            update,
            delete,
            _p: std::marker::PhantomData,
        }
    }

    pub fn list(self) -> CrudRouterBuilder<Re, M, (), C, R, U, D>
    where
        L: Handler,
    {
        let router = self.router.get(self.list);
        CrudRouterBuilder {
            router,
            list: (),
            ..self
        }
    }

    pub fn create(self) -> CrudRouterBuilder<Re, M, L, (), R, U, D>
    where
        C: Handler,
    {
        let router = self.router.post(self.create);
        CrudRouterBuilder {
            router,
            create: (),
            ..self
        }
    }

    pub fn read(self) -> CrudRouterBuilder<Re, M, L, C, (), U, D>
    where
        R: Handler,
    {
        let id_router = self.id_router.get(self.read);
        CrudRouterBuilder {
            id_router,
            read: (),
            ..self
        }
    }

    pub fn update(self) -> CrudRouterBuilder<Re, M, L, C, R, (), D>
    where
        U: Handler,
    {
        let id_router = self.id_router.put(self.update);
        CrudRouterBuilder {
            id_router,
            update: (),
            ..self
        }
    }

    pub fn delete(self) -> CrudRouterBuilder<Re, M, L, C, R, U, ()>
    where
        D: Handler,
    {
        let id_router = self.id_router.delete(self.delete);
        CrudRouterBuilder {
            id_router,
            delete: (),
            ..self
        }
    }

    pub fn without_create(self) -> Router
    where
        L: Handler,
        R: Handler,
        U: Handler,
        D: Handler,
    {
        self.list().read().update().delete().build()
    }

    pub fn all(self) -> Router
    where
        L: Handler,
        C: Handler,
        R: Handler,
        U: Handler,
        D: Handler,
    {
        self.list().create().read().update().delete().build()
    }

    pub fn build(self) -> Router {
        self.router.push(self.id_router)
    }
}

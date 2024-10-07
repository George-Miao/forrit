use forrit_config::get_config;
use forrit_core::model::Job;
use mongodb::bson::oid::ObjectId;
use salvo::{
    cors::{Any, Cors},
    prelude::*,
};
use tap::Pipe;
use tracing::info;

use crate::{
    db::{Collections, Storage},
    dispatcher::{dispatcher_api, refresh_subscription},
    downloader::job_added,
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

#[async_trait]
impl Handler for Collections {
    async fn handle(&self, _: &mut Request, depot: &mut Depot, _: &mut Response, _: &mut FlowCtrl) {
        depot.inject(self.meta.clone());
        depot.inject(self.entry.clone());
        depot.inject(self.jobs.clone());
        depot.inject(self.alias.clone());
    }
}

pub fn api() -> Router {
    let entry_api = build_crud!(EntryStorage, "entry").without_create();
    let meta_api = build_crud!(MetaStorage, "meta").list().read().update().build();
    let alias_api = build_crud!(AliasKV, "alias").all();
    let download_api = build_crud!(Storage<Job>, "download", on_create = job_added)
        .list()
        .read()
        .build();

    Router::new()
        .push(resolver_api())
        .push(dispatcher_api())
        .push(entry_api)
        .push(meta_api)
        .push(alias_api)
        .push(download_api)
}

pub fn gen_oapi() -> Result<String, serde_json::Error> {
    OpenApi::new("Forrit api", env!("CARGO_PKG_VERSION"))
        .merge_router(&api())
        .to_json()
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

    let mut router = api();

    if config.doc.enable {
        let doc = OpenApi::new("Forrit api", env!("CARGO_PKG_VERSION")).merge_router(&router);
        let doc_path = config.doc.path.join("openapi.json");
        router = router
            .push(doc.into_router(doc_path.as_str()))
            .push(Scalar::new(doc_path.into_string()).into_router(config.doc.path.as_str()));
    }

    let service = Service::new(router)
        .hoop(col)
        .hoop(cors)
        .pipe(|s| if config.log { s.hoop(Logger::new()) } else { s })
        .hoop(DebugHoop { debug: config.debug });

    let acceptor = TcpListener::new(config.bind).bind().await;
    Server::new(acceptor).serve(service).await;
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, ToParameters)]
pub struct OidParam {
    #[salvo(parameter(parameter_in = Path, value_type = forrit_core::model::ObjectIdStringSchema))]
    pub id: ObjectId,
}

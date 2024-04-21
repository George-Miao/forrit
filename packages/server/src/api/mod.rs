use forrit_config::get_config;
use forrit_core::model::{Download, Subscription};
use mongodb::bson::oid::ObjectId;
use salvo::{
    cors::{Any, Cors},
    prelude::*,
};
use tracing::info;

use crate::{
    db::{Collections, Storage},
    resolver::{resolver_api, AliasKV, MetaStorage},
    sourcer::EntryStorage,
    subscription::subscription_api,
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
        depot.inject(self.subscription.clone());
        depot.inject(self.download.clone());
        depot.inject(self.alias.clone());
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

    let entry_api = build_crud!(EntryStorage, "entry",).without_create();
    let meta_api = build_crud!(MetaStorage, "meta",).list().read().update().build();
    let alias_api = build_crud!(AliasKV, "alias").all();
    let sub_api = build_crud!(Storage<Subscription>, "subscription",).all();
    let download_api = build_crud!(Storage<Download>, "download",).list().read().build();

    let router = Router::new()
        .push(resolver_api())
        .push(subscription_api())
        .push(entry_api)
        .push(meta_api)
        .push(alias_api)
        .push(sub_api)
        .push(download_api);

    let doc = OpenApi::new("Forrit api", "0.1.0").merge_router(&router);
    let router = router
        .push(doc.into_router("/api-doc/openapi.json"))
        .push(Scalar::new("/api-doc/openapi.json").into_router("scalar"));

    let service = Service::new(router)
        .hoop(col)
        .hoop(cors)
        .hoop(Logger::new())
        .hoop(DebugHoop { debug: config.debug });

    let acceptor = TcpListener::new(config.bind).bind().await;
    Server::new(acceptor).serve(service).await;
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, ToParameters)]
pub struct OidParam {
    #[salvo(parameter(parameter_in = Path, value_type = forrit_core::model::ObjectIdSchema))]
    pub id: ObjectId,
}

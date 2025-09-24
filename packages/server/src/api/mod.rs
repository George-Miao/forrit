use forrit_config::{Config, HTTPAuthConfig};
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
    dispatcher::dispatcher_api,
    downloader::job_added,
    resolver::{AliasKV, MetaStorage, resolver_api},
    sourcer::EntryStorage,
};

mod_use::mod_use![crud, error];
// pub mod dto;

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

struct AuthHoop(HTTPAuthConfig);

#[async_trait]
impl Handler for AuthHoop {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        match &self.0 {
            HTTPAuthConfig::None => {}
            HTTPAuthConfig::Basic { username, password } => {
                struct Validator<'a> {
                    username: &'a str,
                    password: &'a str,
                }

                impl BasicAuthValidator for Validator<'_> {
                    async fn validate(&self, username: &str, password: &str, _depot: &mut Depot) -> bool {
                        username == self.username && password == self.password
                    }
                }

                let validator = Validator { username, password };
                let auth = BasicAuth::new(validator);
                match auth.parse_credentials(req) {
                    Ok(input) => {
                        if &input.0 == username && &input.1 == password {
                            ctrl.call_next(req, depot, res).await;
                        } else {
                            res.status_code(StatusCode::UNAUTHORIZED);
                            res.render("Unauthorized");
                            ctrl.skip_rest();
                        }
                    }
                    Err(_) => {
                        auth.ask_credentials(res);
                        ctrl.skip_rest();
                    }
                }
            }
            _ => unimplemented!("Auth type not implemented"),
        }
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

pub async fn run(col: Collections, config: &'static Config) {
    let config = &config.http;
    if !config.enable {
        std::future::pending().await
    }
    if config.debug {
        info!("Debug mode enabled, this may leak sensitive information and should be disabled in production.");
    };

    let cors = Cors::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .into_handler();

    let mut router = Router::new()
        .push(Router::with_path("api").push(api()))
        .push(if config.webui {
            crate::webui::router()
        } else {
            Router::new()
        });

    if config.doc.enable {
        let doc = OpenApi::new("Forrit api", env!("CARGO_PKG_VERSION")).merge_router(&router);
        let doc_path = config.doc.path.join("openapi.json");
        router = router
            .push(doc.into_router(doc_path.as_str()))
            .push(Scalar::new(doc_path.into_string()).into_router(config.doc.path.as_str()));
    }

    let service = Service::new(router)
        .hoop(AuthHoop(config.auth.clone()))
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

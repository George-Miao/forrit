use forrit_config::{ConfigHandle, HTTPAuthConfig};
use forrit_core::model::Job;
use mongodb::bson::oid::ObjectId;
use salvo::{
    cors::{Any, Cors},
    prelude::*,
};
use tracing::info;

use crate::{
    config::config_api,
    db::{Collections, Storage},
    dispatcher::dispatcher_api,
    downloader::job_added,
    resolver::{MetaStorage, resolver_api},
    search::{AliasStorage, search_api},
    sourcer::EntryStorage,
};

mod_use::mod_use![crud, error];
// pub mod dto;

struct DebugHoop(ConfigHandle);

#[async_trait]
impl Handler for DebugHoop {
    async fn handle(&self, _: &mut Request, depot: &mut Depot, _: &mut Response, _: &mut FlowCtrl) {
        depot.insert("debug", self.0.snapshot().config().http.debug);
    }
}

struct LogHoop(ConfigHandle);

#[async_trait]
impl Handler for LogHoop {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        if self.0.snapshot().config().http.log {
            Logger::new().handle(req, depot, res, ctrl).await;
        }
    }
}

#[async_trait]
impl Handler for Collections {
    async fn handle(&self, _: &mut Request, depot: &mut Depot, _: &mut Response, _: &mut FlowCtrl) {
        depot.inject(self.meta.clone());
        depot.inject(self.entry.clone());
        depot.inject(self.jobs.clone());
        depot.inject(self.alias.clone());
        depot.inject(self.search.clone());
        depot.inject(self.config.clone());
    }
}

struct AuthHoop(ConfigHandle);

#[async_trait]
impl Handler for AuthHoop {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        let snapshot = self.0.snapshot();
        match &snapshot.config().http.auth {
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
    let alias_api = build_crud!(AliasStorage, "alias").all();
    let download_api = build_crud!(Storage<Job>, "download", on_create = job_added)
        .list()
        .read()
        .build();

    Router::new()
        .push(resolver_api())
        .push(dispatcher_api())
        .push(search_api())
        .push(config_api())
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

pub async fn run(col: Collections, handle: ConfigHandle) {
    let startup = handle.snapshot();
    let config = &startup.config().http;
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
    let openapi = OpenApi::new("Forrit api", env!("CARGO_PKG_VERSION"))
        .merge_router(&api())
        .to_json()
        .expect("OpenAPI document must serialize");
    let router = Router::new()
        .push(Router::with_path("api").push(api()))
        .push(crate::webui::router(handle.clone(), openapi));

    let service = Service::new(router)
        .hoop(AuthHoop(handle.clone()))
        .hoop(col)
        .hoop(cors)
        .hoop(LogHoop(handle.clone()))
        .hoop(DebugHoop(handle));

    let acceptor = TcpListener::new(config.bind).bind().await;
    Server::new(acceptor).serve(service).await;
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, ToParameters)]
pub struct OidParam {
    #[salvo(parameter(parameter_in = Path, value_type = forrit_core::model::ObjectIdStringSchema))]
    pub id: ObjectId,
}

#[cfg(test)]
mod tests {
    use forrit_config::{ConfigHandle, camino::Utf8Path, load_config};
    use salvo::{
        prelude::*,
        test::{ResponseExt, TestClient},
    };
    use serde_json::json;

    use super::{AuthHoop, DebugHoop};

    fn config() -> ConfigHandle {
        let mut handle = None;
        figment::Jail::expect_with(|jail| {
            jail.create_file(
                "config.toml",
                r#"
                    [resolver]
                    tmdb_api_key = "test"

                    [database]

                    [downloader]
                    type = "disabled"
                "#,
            )?;
            let layers = load_config(Some(Utf8Path::new("config.toml"))).expect("config must load");
            handle = Some(ConfigHandle::new(layers, json!({}), 0).expect("config must resolve"));
            Ok(())
        });
        handle.expect("config handle must be created")
    }

    #[handler]
    async fn debug(depot: &Depot) -> String {
        depot
            .get::<bool>("debug")
            .copied()
            .expect("debug value must be injected")
            .to_string()
    }

    fn router(config: &ConfigHandle) -> Router {
        Router::with_path("status")
            .hoop(AuthHoop(config.clone()))
            .hoop(DebugHoop(config.clone()))
            .get(debug)
    }

    #[tokio::test]
    async fn applies_authentication_and_debug_changes_per_request() {
        let config = config();
        let initial_debug = config.snapshot().config().http.debug;
        let initial = TestClient::get("http://localhost/status")
            .send(router(&config))
            .await
            .take_string()
            .await
            .expect("initial response must have a body");
        assert_eq!(initial, initial_debug.to_string());

        let next = config
            .prepare(
                json!({
                    "http": {
                        "debug": !initial_debug,
                        "auth": {
                            "type": "basic",
                            "username": "user",
                            "password": "password"
                        }
                    }
                }),
                1,
            )
            .expect("runtime HTTP config must resolve");
        config.publish(next);

        let unauthorized = TestClient::get("http://localhost/status").send(router(&config)).await;
        assert_eq!(unauthorized.status_code, Some(StatusCode::UNAUTHORIZED));
        let authenticated = TestClient::get("http://localhost/status")
            .basic_auth("user", Some("password"))
            .send(router(&config))
            .await
            .take_string()
            .await
            .expect("authenticated response must have a body");
        assert_eq!(authenticated, (!initial_debug).to_string());
    }
}

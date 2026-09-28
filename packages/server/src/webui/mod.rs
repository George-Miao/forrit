use forrit_config::ConfigHandle;
use rust_embed::RustEmbed;
use salvo::{
    Router,
    prelude::*,
    serve_static::{StaticEmbed, static_embed},
};

#[derive(RustEmbed)]
#[folder = "../../frontend/build/client"]
struct Assets;

struct Frontend {
    config: ConfigHandle,
    openapi: String,
    assets: StaticEmbed<Assets>,
}

#[async_trait]
impl Handler for Frontend {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        let snapshot = self.config.snapshot();
        let config = &snapshot.config().http;
        let request_path = req.uri().path().trim_end_matches('/');
        let configured_path = config.doc.path.as_str().trim_end_matches('/');
        let doc_path = if configured_path.is_empty() {
            "/"
        } else {
            configured_path
        };
        let spec_path = if doc_path == "/" {
            "/openapi.json".to_owned()
        } else {
            format!("{doc_path}/openapi.json")
        };

        if config.doc.enable && req.uri().path() == spec_path {
            res.render(Text::Json(self.openapi.clone()));
        } else if config.doc.enable && request_path == doc_path {
            Scalar::new(spec_path).handle(req, depot, res, ctrl).await;
        } else if config.webui {
            self.assets.handle(req, depot, res, ctrl).await;
        } else {
            res.status_code(StatusCode::NOT_FOUND);
        }
    }
}

pub fn router(config: ConfigHandle, openapi: String) -> Router {
    Router::with_path("<**path>").get(Frontend {
        config,
        openapi,
        assets: static_embed::<Assets>().fallback("index.html"),
    })
}

#[cfg(test)]
mod tests {
    use forrit_config::{ConfigHandle, camino::Utf8Path, load_config};
    use salvo::{
        http::StatusCode,
        test::{ResponseExt, TestClient},
    };
    use serde_json::json;

    use super::router;

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

    #[tokio::test]
    async fn applies_webui_and_documentation_changes_without_rebuilding_router() {
        let config = config();
        let html = TestClient::get("http://localhost/api-doc")
            .send(router(config.clone(), "{}".to_owned()))
            .await
            .take_string()
            .await
            .expect("documentation response must have a body");
        assert!(html.contains("api-reference"));

        let next = config
            .prepare(
                json!({
                    "http": {
                        "webui": false,
                        "doc": { "enable": true, "path": "/docs" }
                    }
                }),
                1,
            )
            .expect("runtime HTTP config must resolve");
        config.publish(next);

        let old = TestClient::get("http://localhost/api-doc")
            .send(router(config.clone(), "{}".to_owned()))
            .await;
        assert_eq!(old.status_code, Some(StatusCode::NOT_FOUND));
        let html = TestClient::get("http://localhost/docs")
            .send(router(config.clone(), "{}".to_owned()))
            .await
            .take_string()
            .await
            .expect("moved documentation response must have a body");
        assert!(html.contains("data-url=\"/docs/openapi.json\""));
        let spec = TestClient::get("http://localhost/docs/openapi.json")
            .send(router(config, "{\"openapi\":\"3.0.0\"}".to_owned()))
            .await
            .take_string()
            .await
            .expect("OpenAPI response must have a body");
        assert_eq!(spec, "{\"openapi\":\"3.0.0\"}");
    }
}

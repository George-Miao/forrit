use std::{collections::BTreeMap, fmt, sync::Arc};

use arc_swap::ArcSwap;
use camino::Utf8Path;
use figment::{
    Figment,
    providers::{Env, Format, Json, Serialized, Toml, Yaml},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::info;

use crate::{Config, DatabaseConfig};

const ENV_PREFIX: &str = "FORRIT.";
const UI_PRIORITY_PATHS: &[&str] = &[
    "/resolver/tmdb_api_key",
    "/downloader/type",
    "/downloader/username",
    "/downloader/password",
    "/http/auth/username",
    "/http/auth/password",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConfigSource {
    Default,
    Ui,
    File,
    Environment,
}
impl fmt::Debug for ConfigSnapshot {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ConfigSnapshot")
            .field("revision", &self.revision)
            .finish_non_exhaustive()
    }
}

pub struct ConfigSnapshot {
    config: Config,
    revision: u64,
    sources: BTreeMap<String, ConfigSource>,
    ui: Value,
}

impl ConfigSnapshot {
    #[must_use]
    pub const fn config(&self) -> &Config {
        &self.config
    }

    #[must_use]
    pub const fn revision(&self) -> u64 {
        self.revision
    }

    #[must_use]
    pub fn source(&self, path: &str) -> ConfigSource {
        self.sources.get(path).copied().unwrap_or(ConfigSource::Default)
    }

    #[must_use]
    pub fn ui_can_override(&self, path: &str) -> bool {
        UI_PRIORITY_PATHS.contains(&path)
    }

    #[must_use]
    pub const fn ui(&self) -> &Value {
        &self.ui
    }
}

#[derive(Clone)]
pub struct ConfigLayers {
    file: Value,
    environment: Value,
}

impl fmt::Debug for ConfigLayers {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ConfigLayers").finish_non_exhaustive()
    }
}

impl ConfigLayers {
    pub fn load(path: Option<&Utf8Path>) -> Result<Self, Box<figment::Error>> {
        let file = path.map_or_else(default_files, configured_file);
        let environment = Figment::new().merge(Env::prefixed(ENV_PREFIX).split('.'));

        Ok(Self {
            file: canonicalize_sourcers(extract_layer(&file)?),
            environment: canonicalize_sourcers(extract_layer(&environment)?),
        })
    }

    pub fn database(&self) -> Result<DatabaseConfig, Box<figment::Error>> {
        let mut effective = self.file.clone();
        merge(&mut effective, &self.environment);
        Ok(Figment::new()
            .merge(Serialized::defaults(effective))
            .extract_inner("database")?)
    }

    pub fn resolve(&self, ui: Value, revision: u64) -> Result<ConfigSnapshot, Box<figment::Error>> {
        let ui = canonicalize_sourcers(ui);
        let mut effective = ui.clone();
        merge(&mut effective, &self.file);
        merge(&mut effective, &self.environment);
        merge_ui_overrides(&mut effective, &ui);
        let config: Config = Figment::new().merge(Serialized::defaults(effective)).extract()?;
        let effective = serde_json::to_value(&config).expect("Config must serialize as JSON");
        let mut sources = BTreeMap::new();
        collect_sources("", &effective, &ui, &self.file, &self.environment, &mut sources);

        Ok(ConfigSnapshot {
            config,
            revision,
            sources,
            ui,
        })
    }
}

#[derive(Clone)]
pub struct ConfigHandle {
    layers: Arc<ConfigLayers>,
    current: Arc<ArcSwap<ConfigSnapshot>>,
}

impl fmt::Debug for ConfigHandle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ConfigHandle")
            .field("revision", &self.snapshot().revision())
            .finish_non_exhaustive()
    }
}

impl ConfigHandle {
    pub fn new(layers: ConfigLayers, ui: Value, revision: u64) -> Result<Self, Box<figment::Error>> {
        let snapshot = Arc::new(layers.resolve(ui, revision)?);
        Ok(Self {
            layers: Arc::new(layers),
            current: Arc::new(ArcSwap::from(snapshot)),
        })
    }

    #[must_use]
    pub fn snapshot(&self) -> Arc<ConfigSnapshot> {
        self.current.load_full()
    }

    pub fn prepare(&self, ui: Value, revision: u64) -> Result<Arc<ConfigSnapshot>, Box<figment::Error>> {
        self.layers.resolve(ui, revision).map(Arc::new)
    }

    pub fn publish(&self, snapshot: Arc<ConfigSnapshot>) {
        self.current.store(snapshot);
    }
}

pub fn load_config(path: Option<&Utf8Path>) -> Result<ConfigLayers, Box<figment::Error>> {
    ConfigLayers::load(path)
}

fn default_files() -> Figment {
    info!("Loading config from config files and environment");
    let dir = dirs::config_dir()
        .expect("failed to find config directory")
        .join("forrit");
    Figment::new()
        .merge(Toml::file(dir.join("config.toml")))
        .merge(Yaml::file(dir.join("config.yaml")))
        .merge(Json::file(dir.join("config.json")))
}

fn configured_file(path: &Utf8Path) -> Figment {
    info!("Loading config from {path} and environment");
    match path.extension() {
        None | Some("toml") => Figment::new().join(Toml::file(path)),
        Some("yaml" | "yml") => Figment::new().join(Yaml::file(path)),
        Some("json") => Figment::new().join(Json::file(path)),
        _ => panic!("Unsupported config file format"),
    }
}

fn extract_layer(figment: &Figment) -> Result<Value, Box<figment::Error>> {
    let values = figment.extract::<BTreeMap<String, Value>>()?;
    Ok(Value::Object(values.into_iter().collect()))
}

fn canonicalize_sourcers(mut value: Value) -> Value {
    let Some(sourcers) = value.get_mut("sourcer") else {
        return value;
    };
    let Value::Array(items) = sourcers else {
        return value;
    };
    let map = std::mem::take(items)
        .into_iter()
        .enumerate()
        .map(|(index, item)| (format!("rss-{index}"), item))
        .collect();
    *sourcers = Value::Object(map);
    value
}

fn merge(base: &mut Value, overlay: &Value) {
    if let (Value::Object(base), Value::Object(overlay)) = (&mut *base, overlay) {
        for (key, value) in overlay {
            if let Some(base) = base.get_mut(key) {
                merge(base, value);
            } else {
                base.insert(key.clone(), value.clone());
            }
        }
    } else {
        *base = overlay.clone();
    }
}

fn merge_ui_overrides(effective: &mut Value, ui: &Value) {
    for path in UI_PRIORITY_PATHS {
        let Some(value) = ui.pointer(path) else {
            continue;
        };
        let target = effective
            .pointer_mut(path)
            .expect("effective configuration must contain every UI value");
        target.clone_from(value);
    }
}

fn collect_sources(
    path: &str,
    effective: &Value,
    ui: &Value,
    file: &Value,
    environment: &Value,
    sources: &mut BTreeMap<String, ConfigSource>,
) {
    if let Value::Object(values) = effective {
        for (key, value) in values {
            let path = pointer(path, key);
            collect_sources(&path, value, ui, file, environment, sources);
        }
        return;
    }

    let source = if UI_PRIORITY_PATHS.contains(&path) && ui.pointer(path).is_some() {
        ConfigSource::Ui
    } else if environment.pointer(path).is_some() {
        ConfigSource::Environment
    } else if file.pointer(path).is_some() {
        ConfigSource::File
    } else if ui.pointer(path).is_some() {
        ConfigSource::Ui
    } else {
        ConfigSource::Default
    };
    sources.insert(path.to_owned(), source);
}

fn pointer(parent: &str, key: &str) -> String {
    let key = key.replace('~', "~0").replace('/', "~1");
    format!("{parent}/{key}")
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{ConfigHandle, ConfigLayers, ConfigSource, canonicalize_sourcers};

    #[test]
    fn resolves_ui_activation_and_secrets_above_file_and_environment() {
        let layers = ConfigLayers {
            file: json!({
                "resolver": { "tmdb_api_key": "file", "tmdb_rate_limit": 20 },
                "database": {},
                "downloader": { "type": "disabled" },
                "http": {
                    "auth": {
                        "type": "basic",
                        "username": "file-http",
                        "password": "file-http"
                    }
                }
            }),
            environment: json!({
                "resolver": { "tmdb_rate_limit": 30 },
                "http": { "auth": { "password": "environment-http" } }
            }),
        };
        let snapshot = layers
            .resolve(
                json!({
                    "resolver": { "tmdb_api_key": "ui", "tmdb_rate_limit": 10 },
                    "downloader": {
                        "type": "qbittorrent",
                        "username": "ui-downloader",
                        "password": "ui-downloader"
                    },
                    "http": {
                        "log": true,
                        "auth": { "username": "ui-http", "password": "ui-http" }
                    }
                }),
                4,
            )
            .expect("layers must resolve");

        assert_eq!(snapshot.config().resolver.tmdb_api_key, "ui");
        let crate::DownloaderType::Qbittorrent(qbit) = &snapshot.config().downloader.ty else {
            panic!("UI must enable qBittorrent");
        };
        assert_eq!(qbit.auth.username, "ui-downloader");
        assert_eq!(qbit.auth.password, "ui-downloader");
        let crate::HTTPAuthConfig::Basic { username, password } = &snapshot.config().http.auth else {
            panic!("file must enable HTTP basic authentication");
        };
        assert_eq!(username, "ui-http");
        assert_eq!(password, "ui-http");
        assert_eq!(snapshot.config().resolver.tmdb_rate_limit.get(), 30);
        assert!(snapshot.config().http.log);
        assert_eq!(snapshot.revision(), 4);
        assert_eq!(snapshot.source("/resolver/tmdb_api_key"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/downloader/type"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/resolver/tmdb_rate_limit"), ConfigSource::Environment);
        assert_eq!(snapshot.source("/downloader/username"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/downloader/password"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/http/auth/username"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/http/auth/password"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/http/log"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/http/debug"), ConfigSource::Default);
    }
    #[test]
    fn publishes_complete_snapshots_atomically() {
        let layers = ConfigLayers {
            file: json!({
                "resolver": { "tmdb_api_key": "file" },
                "database": {},
                "downloader": { "type": "disabled" }
            }),
            environment: json!({}),
        };
        let handle = ConfigHandle::new(layers, json!({}), 0).expect("initial config must resolve");
        let previous = handle.snapshot();
        let next = handle
            .prepare(json!({ "http": { "log": true } }), 1)
            .expect("updated config must resolve");

        handle.publish(next);

        assert!(!previous.config().http.log);
        assert!(handle.snapshot().config().http.log);
        assert_eq!(handle.snapshot().revision(), 1);
    }

    #[test]
    fn gives_list_sources_stable_names_for_ui_overrides() {
        let layers = ConfigLayers {
            file: canonicalize_sourcers(json!({
                "resolver": { "tmdb_api_key": "file" },
                "database": {},
                "sourcer": [{
                    "type": "rss",
                    "url": "https://example.com/feed.xml"
                }],
                "downloader": { "type": "disabled" }
            })),
            environment: json!({}),
        };
        let snapshot = layers
            .resolve(json!({ "sourcer": { "rss-0": { "enable": false } } }), 1)
            .expect("source override must resolve");
        let (name, source) = snapshot
            .config()
            .sourcer
            .iter("rss-")
            .next()
            .expect("source must exist");

        assert_eq!(name, "rss-0");
        assert!(!source.enable);
        assert_eq!(snapshot.source("/sourcer/rss-0/enable"), ConfigSource::Ui);
        assert_eq!(snapshot.source("/sourcer/rss-0/url"), ConfigSource::File);
    }
}

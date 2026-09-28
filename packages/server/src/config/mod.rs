use std::{
    fmt,
    num::NonZeroU32,
    sync::{Arc, Mutex},
    time::Duration,
};

use forrit_config::{
    Config, ConfigHandle, ConfigLayers, ConfigSnapshot, ConfigSource, DownloaderType, HTTPAuthConfig, SourcerType,
};
use mongodb::{
    Collection, Database,
    bson::doc,
    error::{ErrorKind, WriteFailure},
};
use regex::RegexSet;
use salvo::oapi::ToSchema;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use thiserror::Error;

mod api;

pub use api::config_api;

const DOCUMENT_ID: &str = "global";

#[derive(Clone, Serialize, Deserialize)]
struct ConfigDocument {
    #[serde(rename = "_id")]
    id: String,
    revision: i64,
    values: Value,
}

impl fmt::Debug for ConfigDocument {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ConfigDocument")
            .field("id", &self.id)
            .field("revision", &self.revision)
            .finish_non_exhaustive()
    }
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Database error: {0}")]
    Database(#[from] mongodb::error::Error),

    #[error("Invalid configuration: {0}")]
    Invalid(String),

    #[error("Configuration revision is stale")]
    Conflict,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum FieldSource {
    Default,
    Ui,
    File,
    Environment,
}

impl From<ConfigSource> for FieldSource {
    fn from(value: ConfigSource) -> Self {
        match value {
            ConfigSource::Default => Self::Default,
            ConfigSource::Ui => Self::Ui,
            ConfigSource::File => Self::File,
            ConfigSource::Environment => Self::Environment,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum ApplyMode {
    Immediate,
    NextStartup,
    NextEnable,
}
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema)]
#[serde(untagged)]
pub enum ConfigValue {
    Boolean(bool),
    Integer(u64),
    String(String),
    Strings(Vec<String>),
    Null,
}

impl TryFrom<Value> for ConfigValue {
    type Error = &'static str;

    fn try_from(value: Value) -> Result<Self, Self::Error> {
        match value {
            Value::Bool(value) => Ok(Self::Boolean(value)),
            Value::Number(value) => value
                .as_u64()
                .map(Self::Integer)
                .ok_or("configuration number must be a non-negative integer"),
            Value::String(value) => Ok(Self::String(value)),
            Value::Array(values) => values
                .into_iter()
                .map(|value| match value {
                    Value::String(value) => Ok(value),
                    _ => Err("configuration list values must be strings"),
                })
                .collect::<Result<_, _>>()
                .map(Self::Strings),
            Value::Null => Ok(Self::Null),
            Value::Object(_) => Err("configuration values must not be objects"),
        }
    }
}

impl From<ConfigValue> for Value {
    fn from(value: ConfigValue) -> Self {
        match value {
            ConfigValue::Boolean(value) => Self::Bool(value),
            ConfigValue::Integer(value) => Self::Number(value.into()),
            ConfigValue::String(value) => Self::String(value),
            ConfigValue::Strings(values) => Self::Array(values.into_iter().map(Self::String).collect()),
            ConfigValue::Null => Self::Null,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct ConfigField {
    pub path: String,
    pub value: Option<ConfigValue>,
    pub source: FieldSource,
    pub locked: bool,
    pub secret: bool,
    pub secret_set: bool,
    pub apply: ApplyMode,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum SourceKind {
    Rss,
    AcgRip,
    Nyaa,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct SourceView {
    pub name: String,
    pub kind: SourceKind,
    pub deletable: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct ConfigView {
    pub revision: u64,
    pub fields: Vec<ConfigField>,
    pub sources: Vec<SourceView>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SourceInputType {
    Rss {
        enable: bool,
        url: String,
        update_interval: String,
        deny_non_torrent: bool,
    },
    AcgRip {
        enable: bool,
        update_interval: String,
        zone: Option<u8>,
        page: Option<u8>,
        deny_non_torrent: bool,
        load_history_pages: Option<u32>,
    },
    Nyaa {
        enable: bool,
        update_interval: String,
        category: String,
        load_history_pages: Option<u32>,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct ConfigUpdate {
    pub revision: u64,
    pub changes: Vec<ConfigChange>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema)]
#[serde(tag = "op", rename_all = "snake_case")]
pub enum ConfigChange {
    Set { path: String, value: ConfigValue },
    Unset { path: String },
    CreateSource { name: String, source: SourceInputType },
    DeleteSource { name: String },
}

#[derive(Debug, Clone)]
pub struct ConfigStore {
    collection: Collection<ConfigDocument>,
    handle: ConfigHandle,
    warnings: Arc<Mutex<Vec<String>>>,
}

impl ConfigStore {
    pub async fn new(database: &Database, layers: ConfigLayers) -> Result<Self, ConfigError> {
        let collection: Collection<ConfigDocument> = database.collection("config");
        let document = collection.find_one(doc! { "_id": DOCUMENT_ID }, None).await?;
        let (revision, values) = match document {
            Some(document) => (
                u64::try_from(document.revision)
                    .map_err(|_| ConfigError::Invalid("stored configuration revision is negative".to_owned()))?,
                document.values,
            ),
            None => (0, json!({})),
        };
        let handle =
            ConfigHandle::new(layers, values, revision).map_err(|error| ConfigError::Invalid(error.to_string()))?;
        validate(handle.snapshot().config())?;
        Ok(Self {
            collection,
            handle,
            warnings: Arc::new(Mutex::new(Vec::new())),
        })
    }

    #[must_use]
    pub fn handle(&self) -> ConfigHandle {
        self.handle.clone()
    }

    #[must_use]
    pub fn view(&self) -> ConfigView {
        let mut view = view(&self.handle.snapshot());
        view.warnings = self.warnings().clone();
        view
    }

    pub(crate) fn warning(&self, warning: impl Into<String>) {
        const MAX_WARNINGS: usize = 20;

        let warning = warning.into();
        let mut warnings = self.warnings();
        if warnings.last() == Some(&warning) {
            return;
        }
        if warnings.len() == MAX_WARNINGS {
            warnings.remove(0);
        }
        warnings.push(warning);
    }

    pub(crate) fn clear_warnings(&self) {
        self.warnings().clear();
    }

    fn warnings(&self) -> std::sync::MutexGuard<'_, Vec<String>> {
        self.warnings.lock().unwrap_or_else(std::sync::PoisonError::into_inner)
    }

    pub async fn update(&self, update: ConfigUpdate) -> Result<ConfigView, ConfigError> {
        let current = self.handle.snapshot();
        if current.revision() != update.revision {
            self.refresh().await?;
            return Err(ConfigError::Conflict);
        }

        let mut values = current.ui().clone();
        for change in update.changes {
            apply_change(&current, &mut values, change)?;
        }
        let revision = update
            .revision
            .checked_add(1)
            .ok_or_else(|| ConfigError::Invalid("configuration revision exhausted".to_owned()))?;
        let next = self
            .handle
            .prepare(values.clone(), revision)
            .map_err(|error| ConfigError::Invalid(error.to_string()))?;
        validate(next.config())?;
        match self.persist(update.revision, revision, values).await {
            Ok(()) => {}
            Err(ConfigError::Conflict) => {
                self.refresh().await?;
                return Err(ConfigError::Conflict);
            }
            Err(error) => return Err(error),
        }
        self.handle.publish(next);
        self.clear_warnings();
        Ok(self.view())
    }

    async fn persist(&self, expected: u64, revision: u64, values: Value) -> Result<(), ConfigError> {
        let expected = i64::try_from(expected)
            .map_err(|_| ConfigError::Invalid("configuration revision is too large".to_owned()))?;
        let revision = i64::try_from(revision)
            .map_err(|_| ConfigError::Invalid("configuration revision is too large".to_owned()))?;
        let document = ConfigDocument {
            id: DOCUMENT_ID.to_owned(),
            revision,
            values,
        };
        let result = self
            .collection
            .replace_one(doc! { "_id": DOCUMENT_ID, "revision": expected }, &document, None)
            .await?;
        if result.matched_count == 1 {
            return Ok(());
        }
        if expected != 0 {
            return Err(ConfigError::Conflict);
        }
        match self.collection.insert_one(document, None).await {
            Ok(_) => Ok(()),
            Err(error)
                if matches!(
                    error.kind.as_ref(),
                    ErrorKind::Write(WriteFailure::WriteError(error)) if error.code == 11000
                ) =>
            {
                Err(ConfigError::Conflict)
            }
            Err(error) => Err(error.into()),
        }
    }

    async fn refresh(&self) -> Result<(), ConfigError> {
        let Some(document) = self.collection.find_one(doc! { "_id": DOCUMENT_ID }, None).await? else {
            return Ok(());
        };
        let revision = u64::try_from(document.revision)
            .map_err(|_| ConfigError::Invalid("stored configuration revision is negative".to_owned()))?;
        if revision <= self.handle.snapshot().revision() {
            return Ok(());
        }
        let next = self
            .handle
            .prepare(document.values, revision)
            .map_err(|error| ConfigError::Invalid(error.to_string()))?;
        validate(next.config())?;
        self.handle.publish(next);
        Ok(())
    }
}

fn apply_change(current: &ConfigSnapshot, values: &mut Value, change: ConfigChange) -> Result<(), ConfigError> {
    match change {
        ConfigChange::Set { path, value } => apply_field_change(current, values, path, Some(value.into())),
        ConfigChange::Unset { path } => apply_field_change(current, values, path, None),
        ConfigChange::CreateSource { name, source } => {
            validate_source_name(&name)?;
            if current
                .config()
                .sourcer
                .iter("rss-")
                .any(|(current, _)| current == name)
            {
                return Err(ConfigError::Invalid(format!("source already exists: {name}")));
            }
            let path = format!("/sourcer/{}", escape(&name));
            let source = serde_json::to_value(source).map_err(|error| ConfigError::Invalid(error.to_string()))?;
            set_pointer(values, &path, Some(source))
        }
        ConfigChange::DeleteSource { name } => {
            validate_source_name(&name)?;
            if !current
                .config()
                .sourcer
                .iter("rss-")
                .any(|(current, _)| current == name)
            {
                return Err(ConfigError::Invalid(format!("source does not exist: {name}")));
            }
            let path = format!("/sourcer/{}", escape(&name));
            if current.source(&format!("{path}/type")) != ConfigSource::Ui {
                return Err(ConfigError::Invalid(format!(
                    "source is locked by a higher configuration layer: {name}"
                )));
            }
            set_pointer(values, &path, None)
        }
    }
}

fn apply_field_change(
    current: &ConfigSnapshot,
    values: &mut Value,
    path: String,
    value: Option<Value>,
) -> Result<(), ConfigError> {
    if !allowed(current.config(), &path) {
        return Err(ConfigError::Invalid(format!(
            "configuration path is not editable: {path}"
        )));
    }
    if matches!(current.source(&path), ConfigSource::File | ConfigSource::Environment)
        && !current.ui_can_override(&path)
    {
        return Err(ConfigError::Invalid(format!("configuration path is locked: {path}")));
    }
    set_pointer(values, &path, value)
}

fn validate_source_name(name: &str) -> Result<(), ConfigError> {
    if name.is_empty()
        || name.chars().count() > 64
        || !name
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-'))
    {
        return Err(ConfigError::Invalid(
            "source name must use 1-64 ASCII letters, numbers, dots, underscores, or hyphens".to_owned(),
        ));
    }
    Ok(())
}

fn allowed(config: &Config, path: &str) -> bool {
    const FIELDS: &[&str] = &[
        "/resolver/tmdb_api_key",
        "/resolver/tmdb_rate_limit",
        "/resolver/index/enable",
        "/resolver/index/start_at_begin",
        "/resolver/index/interval",
        "/subscription/exclude",
        "/downloader/type",
        "/downloader/check_interval",
        "/downloader/savepath",
        "/downloader/url",
        "/downloader/username",
        "/downloader/password",
        "/downloader/rename/enable",
        "/downloader/rename/interval",
        "/downloader/rename/format",
        "/http/webui",
        "/http/log",
        "/http/debug",
        "/http/doc/enable",
        "/http/doc/path",
        "/http/auth/type",
        "/http/auth/username",
        "/http/auth/password",
    ];
    if FIELDS.contains(&path) {
        return true;
    }
    config.sourcer.iter("rss-").any(|(name, source)| {
        let root = format!("/sourcer/{}/", escape(&name));
        path.strip_prefix(&root).is_some_and(|field| match &source.ty {
            SourcerType::Rss(_) => matches!(field, "enable" | "url" | "update_interval" | "deny_non_torrent"),
            SourcerType::AcgRip(_) => matches!(
                field,
                "enable" | "update_interval" | "zone" | "page" | "deny_non_torrent" | "load_history_pages"
            ),
            SourcerType::Nyaa(_) => {
                matches!(field, "enable" | "update_interval" | "category" | "load_history_pages")
            }
        })
    })
}

fn set_pointer(root: &mut Value, path: &str, value: Option<Value>) -> Result<(), ConfigError> {
    let mut parts = path
        .strip_prefix('/')
        .ok_or_else(|| ConfigError::Invalid("configuration path must be a JSON pointer".to_owned()))?
        .split('/')
        .map(unescape)
        .peekable();
    let mut current = root;
    while let Some(part) = parts.next() {
        let last = parts.peek().is_none();
        let object = current
            .as_object_mut()
            .ok_or_else(|| ConfigError::Invalid(format!("configuration path crosses a scalar: {path}")))?;
        if last {
            if let Some(value) = value {
                object.insert(part, value);
            } else {
                object.remove(&part);
            }
            return Ok(());
        }
        current = object.entry(part).or_insert_with(|| Value::Object(Map::new()));
    }
    Err(ConfigError::Invalid("configuration path must not be empty".to_owned()))
}

fn view(snapshot: &ConfigSnapshot) -> ConfigView {
    let config = snapshot.config();
    let mut fields = vec![
        secret(
            snapshot,
            "/resolver/tmdb_api_key",
            !config.resolver.tmdb_api_key.is_empty(),
            ApplyMode::Immediate,
        ),
        field(
            snapshot,
            "/resolver/tmdb_rate_limit",
            config.resolver.tmdb_rate_limit.get(),
            ApplyMode::Immediate,
        ),
        field(
            snapshot,
            "/resolver/index/enable",
            config.resolver.index.enable,
            ApplyMode::Immediate,
        ),
        field(
            snapshot,
            "/resolver/index/start_at_begin",
            config.resolver.index.start_at_begin,
            ApplyMode::NextStartup,
        ),
        duration(
            snapshot,
            "/resolver/index/interval",
            config.resolver.index.interval,
            ApplyMode::Immediate,
        ),
    ];
    let mut sources = Vec::new();
    for (name, source) in config.sourcer.iter("rss-") {
        let root = format!("/sourcer/{}", escape(&name));
        sources.push(SourceView {
            name: name.clone(),
            kind: match &source.ty {
                SourcerType::Rss(_) => SourceKind::Rss,
                SourcerType::AcgRip(_) => SourceKind::AcgRip,
                SourcerType::Nyaa(_) => SourceKind::Nyaa,
            },
            deletable: snapshot.source(&format!("{root}/type")) == ConfigSource::Ui,
        });
        fields.push(field(
            snapshot,
            &format!("{root}/enable"),
            source.enable,
            ApplyMode::Immediate,
        ));
        match &source.ty {
            SourcerType::Rss(source) => {
                fields.push(field(
                    snapshot,
                    &format!("{root}/url"),
                    source.url.as_str(),
                    ApplyMode::Immediate,
                ));
                fields.push(duration(
                    snapshot,
                    &format!("{root}/update_interval"),
                    source.update_interval,
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/deny_non_torrent"),
                    source.deny_non_torrent,
                    ApplyMode::Immediate,
                ));
            }
            SourcerType::AcgRip(source) => {
                fields.push(duration(
                    snapshot,
                    &format!("{root}/update_interval"),
                    source.update_interval,
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/zone"),
                    source.zone.map(NonZeroU32::from).map(NonZeroU32::get),
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/page"),
                    source.page.map(NonZeroU32::from).map(NonZeroU32::get),
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/deny_non_torrent"),
                    source.deny_non_torrent,
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/load_history_pages"),
                    source.load_history_pages.map(NonZeroU32::get),
                    ApplyMode::NextEnable,
                ));
            }
            SourcerType::Nyaa(source) => {
                fields.push(duration(
                    snapshot,
                    &format!("{root}/update_interval"),
                    source.update_interval,
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/category"),
                    &source.category,
                    ApplyMode::Immediate,
                ));
                fields.push(field(
                    snapshot,
                    &format!("{root}/load_history_pages"),
                    source.load_history_pages.map(NonZeroU32::get),
                    ApplyMode::NextEnable,
                ));
            }
        }
    }
    fields.push(field(
        snapshot,
        "/subscription/exclude",
        &config.subscription.exclude,
        ApplyMode::Immediate,
    ));
    fields.extend(downloader_fields(snapshot));
    fields.extend(http_fields(snapshot));
    ConfigView {
        revision: snapshot.revision(),
        fields,
        sources,
        warnings: Vec::new(),
    }
}

fn downloader_fields(snapshot: &ConfigSnapshot) -> Vec<ConfigField> {
    let config = &snapshot.config().downloader;
    let mut fields = vec![
        field(
            snapshot,
            "/downloader/type",
            match config.ty {
                DownloaderType::Disabled => "disabled",
                DownloaderType::Qbittorrent(_) => "qbittorrent",
                DownloaderType::Transmission(_) => "transmission",
            },
            ApplyMode::Immediate,
        ),
        field(
            snapshot,
            "/downloader/rename/enable",
            config.rename.enable,
            ApplyMode::Immediate,
        ),
        duration(
            snapshot,
            "/downloader/rename/interval",
            config.rename.interval,
            ApplyMode::Immediate,
        ),
        field(
            snapshot,
            "/downloader/rename/format",
            serde_json::to_value(&config.rename.format).expect("rename format must serialize"),
            ApplyMode::Immediate,
        ),
    ];
    if let DownloaderType::Qbittorrent(qbit) = &config.ty {
        fields.extend([
            duration(
                snapshot,
                "/downloader/check_interval",
                qbit.check_interval,
                ApplyMode::Immediate,
            ),
            field(
                snapshot,
                "/downloader/savepath",
                qbit.savepath.as_ref().map(ToString::to_string),
                ApplyMode::Immediate,
            ),
            field(snapshot, "/downloader/url", qbit.url.as_str(), ApplyMode::Immediate),
            secret(
                snapshot,
                "/downloader/username",
                !qbit.auth.username.is_empty(),
                ApplyMode::Immediate,
            ),
            secret(
                snapshot,
                "/downloader/password",
                !qbit.auth.password.is_empty(),
                ApplyMode::Immediate,
            ),
        ]);
    } else {
        fields.extend([
            secret(snapshot, "/downloader/username", false, ApplyMode::Immediate),
            secret(snapshot, "/downloader/password", false, ApplyMode::Immediate),
        ]);
    }
    fields
}

fn http_fields(snapshot: &ConfigSnapshot) -> Vec<ConfigField> {
    let config = &snapshot.config().http;
    let mut fields = vec![
        field(snapshot, "/http/webui", config.webui, ApplyMode::Immediate),
        field(snapshot, "/http/log", config.log, ApplyMode::Immediate),
        field(snapshot, "/http/debug", config.debug, ApplyMode::Immediate),
        field(snapshot, "/http/doc/enable", config.doc.enable, ApplyMode::Immediate),
        field(
            snapshot,
            "/http/doc/path",
            config.doc.path.as_str(),
            ApplyMode::Immediate,
        ),
    ];
    match &config.auth {
        HTTPAuthConfig::None => fields.extend([
            field(snapshot, "/http/auth/type", "none", ApplyMode::Immediate),
            secret(snapshot, "/http/auth/username", false, ApplyMode::Immediate),
            secret(snapshot, "/http/auth/password", false, ApplyMode::Immediate),
        ]),
        HTTPAuthConfig::Basic { username, password } => fields.extend([
            field(snapshot, "/http/auth/type", "basic", ApplyMode::Immediate),
            secret(
                snapshot,
                "/http/auth/username",
                !username.is_empty(),
                ApplyMode::Immediate,
            ),
            secret(
                snapshot,
                "/http/auth/password",
                !password.is_empty(),
                ApplyMode::Immediate,
            ),
        ]),
        _ => {}
    }
    fields
}

fn field(snapshot: &ConfigSnapshot, path: &str, value: impl Serialize, apply: ApplyMode) -> ConfigField {
    let source = FieldSource::from(snapshot.source(path));
    ConfigField {
        path: path.to_owned(),
        value: Some(
            ConfigValue::try_from(serde_json::to_value(value).expect("config field must serialize"))
                .expect("config field must be a supported scalar or string list"),
        ),
        source,
        locked: matches!(source, FieldSource::File | FieldSource::Environment) && !snapshot.ui_can_override(path),
        secret: false,
        secret_set: false,
        apply,
    }
}

fn secret(snapshot: &ConfigSnapshot, path: &str, set: bool, apply: ApplyMode) -> ConfigField {
    let source = FieldSource::from(snapshot.source(path));
    ConfigField {
        path: path.to_owned(),
        value: None,
        source,
        locked: matches!(source, FieldSource::File | FieldSource::Environment) && !snapshot.ui_can_override(path),
        secret: true,
        secret_set: set,
        apply,
    }
}

fn duration(snapshot: &ConfigSnapshot, path: &str, value: Duration, apply: ApplyMode) -> ConfigField {
    field(snapshot, path, humantime::format_duration(value).to_string(), apply)
}

fn validate(config: &Config) -> Result<(), ConfigError> {
    if config.resolver.tmdb_api_key.trim().is_empty() {
        return Err(ConfigError::Invalid("TMDB API key must not be empty".to_owned()));
    }
    if config.resolver.index.interval.is_zero() {
        return Err(ConfigError::Invalid(
            "resolver index interval must be positive".to_owned(),
        ));
    }
    RegexSet::new(&config.subscription.exclude)
        .map_err(|error| ConfigError::Invalid(format!("invalid global subscription exclusion: {error}")))?;
    if !config.http.doc.path.as_str().starts_with('/') {
        return Err(ConfigError::Invalid(
            "API documentation path must start with '/'".to_owned(),
        ));
    }
    let doc_path = config.http.doc.path.as_str().trim_end_matches('/');
    if doc_path == "/api" || doc_path.starts_with("/api/") {
        return Err(ConfigError::Invalid(
            "API documentation path must not use the reserved '/api' path".to_owned(),
        ));
    }
    if let HTTPAuthConfig::Basic { username, password } = &config.http.auth
        && (username.is_empty() || password.is_empty())
    {
        return Err(ConfigError::Invalid(
            "HTTP basic authentication requires a username and password".to_owned(),
        ));
    }
    for (name, source) in config.sourcer.iter("rss-") {
        let interval = match &source.ty {
            SourcerType::Rss(source) => source.update_interval,
            SourcerType::AcgRip(source) => source.update_interval,
            SourcerType::Nyaa(source) => {
                let valid_category = source.category.split_once('_').is_some_and(|(category, subcategory)| {
                    category.parse::<u32>().is_ok() && subcategory.parse::<u32>().is_ok()
                });
                if !valid_category {
                    return Err(ConfigError::Invalid(format!("invalid Nyaa category for source {name}")));
                }
                source.update_interval
            }
        };
        if interval.is_zero() {
            return Err(ConfigError::Invalid(format!(
                "source interval must be positive: {name}"
            )));
        }
    }
    if config.downloader.rename.interval.is_zero() {
        return Err(ConfigError::Invalid("rename interval must be positive".to_owned()));
    }
    if let DownloaderType::Qbittorrent(config) = &config.downloader.ty
        && config.check_interval.is_zero()
    {
        return Err(ConfigError::Invalid(
            "qBittorrent check interval must be positive".to_owned(),
        ));
    }
    if matches!(config.downloader.ty, DownloaderType::Transmission(_)) {
        return Err(ConfigError::Invalid(
            "Transmission downloader is not implemented".to_owned(),
        ));
    }
    Ok(())
}

fn escape(value: &str) -> String {
    value.replace('~', "~0").replace('/', "~1")
}

fn unescape(value: &str) -> String {
    value.replace("~1", "/").replace("~0", "~")
}

#[cfg(test)]
mod tests {
    use forrit_config::{ConfigHandle, DownloaderType, camino::Utf8Path, load_config};
    use serde_json::json;

    use super::{ConfigChange, ConfigError, ConfigValue, FieldSource, SourceInputType, apply_change, view};

    fn config(source: &str) -> ConfigHandle {
        let mut handle = None;
        figment::Jail::expect_with(|jail| {
            jail.clear_env();
            jail.create_file(
                "config.toml",
                &format!(
                    r#"
                        [resolver]
                        tmdb_api_key = "test"

                        [database]

                        [downloader]
                        type = "disabled"

                        {source}
                    "#,
                ),
            )?;
            let layers = load_config(Some(Utf8Path::new("config.toml"))).expect("config must load");
            handle = Some(ConfigHandle::new(layers, json!({}), 0).expect("config must resolve"));
            Ok(())
        });
        handle.expect("config handle must be created")
    }

    #[test]
    fn creates_and_deletes_ui_sources() {
        let handle = config("");
        let initial = handle.snapshot();
        let mut values = initial.ui().clone();
        apply_change(&initial, &mut values, ConfigChange::CreateSource {
            name: "anime".to_owned(),
            source: SourceInputType::Nyaa {
                enable: true,
                update_interval: "5m".to_owned(),
                category: "1_3".to_owned(),
                load_history_pages: None,
            },
        })
        .expect("UI source must be created");
        let created = handle.prepare(values, 1).expect("created source must resolve");
        assert_eq!(view(&created).sources[0].name, "anime");
        assert!(view(&created).sources[0].deletable);

        let mut values = created.ui().clone();
        apply_change(&created, &mut values, ConfigChange::DeleteSource {
            name: "anime".to_owned(),
        })
        .expect("UI source must be deleted");
        let deleted = handle.prepare(values, 2).expect("deleted source must resolve");
        assert!(view(&deleted).sources.is_empty());
    }

    #[test]
    fn rejects_deleting_file_sources() {
        let handle = config(
            r#"
                [sourcer.locked]
                type = "nyaa"
            "#,
        );
        let current = handle.snapshot();
        let mut values = current.ui().clone();
        let result = apply_change(&current, &mut values, ConfigChange::DeleteSource {
            name: "locked".to_owned(),
        });

        assert!(matches!(result, Err(ConfigError::Invalid(message)) if message.contains("locked")));
    }

    #[test]
    fn replaces_file_secret_from_ui() {
        let handle = config("");
        let current = handle.snapshot();
        let mut values = current.ui().clone();
        apply_change(&current, &mut values, ConfigChange::Set {
            path: "/resolver/tmdb_api_key".to_owned(),
            value: ConfigValue::String("ui".to_owned()),
        })
        .expect("UI must replace a file secret");

        let next = handle.prepare(values, 1).expect("replacement must resolve");
        assert_eq!(next.config().resolver.tmdb_api_key, "ui");
        let field = view(&next)
            .fields
            .into_iter()
            .find(|field| field.path == "/resolver/tmdb_api_key")
            .expect("secret field must exist");
        assert_eq!(field.source, FieldSource::Ui);
        assert!(!field.locked);
    }

    #[test]
    fn rejects_replacing_file_non_secret_from_ui() {
        let handle = config(
            r#"
                [http]
                log = true
            "#,
        );
        let current = handle.snapshot();
        let mut values = current.ui().clone();
        let result = apply_change(&current, &mut values, ConfigChange::Set {
            path: "/http/log".to_owned(),
            value: ConfigValue::Boolean(false),
        });

        assert!(matches!(result, Err(ConfigError::Invalid(message)) if message.contains("locked")));
    }

    #[test]
    fn enables_file_disabled_downloader_from_ui() {
        let handle = config("");
        let current = handle.snapshot();
        let field = view(&current)
            .fields
            .into_iter()
            .find(|field| field.path == "/downloader/type")
            .expect("downloader type field must exist");
        assert!(!field.locked);

        let mut values = current.ui().clone();
        for (path, value) in [
            ("/downloader/type", "qbittorrent"),
            ("/downloader/username", ""),
            ("/downloader/password", ""),
        ] {
            apply_change(&current, &mut values, ConfigChange::Set {
                path: path.to_owned(),
                value: ConfigValue::String(value.to_owned()),
            })
            .expect("UI must enable the downloader without credentials");
        }

        let next = handle.prepare(values, 1).expect("downloader activation must resolve");
        assert!(matches!(next.config().downloader.ty, DownloaderType::Qbittorrent(_)));
        assert_eq!(next.source("/downloader/type"), forrit_config::ConfigSource::Ui);
    }
}

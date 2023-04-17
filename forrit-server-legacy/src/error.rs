use reqwest::StatusCode;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Core error: {0}")]
    Core(#[from] forrit_core::Error),

    #[error("Config init error: {0}")]
    ConfigInitError(&'static str),

    #[error("Unable to detect config directory")]
    DetectConfigDir,

    #[error("Config error: {0}")]
    ConfigError(&'static str),

    #[error("Twelf error: {0}")]
    ConfigGeneratorError(#[from] twelf::Error),

    #[error("Request status error({0})")]
    StatusError(StatusCode),

    #[error("Request error: {0}")]
    RequestError(reqwest::Error),

    #[error("Error: {0}")]
    AdHocError(#[from] Box<dyn std::error::Error + Send + Sync>),

    #[error("Error: {0}")]
    AdHocStringError(String),

    #[error("Non-utf8 char found")]
    NonUTF8Error,

    #[error("Sled error: {0}")]
    SledError(#[from] sled::Error),

    #[error("Serde-json error: {0}")]
    SerdeJsonError(#[from] serde_json::Error),

    #[error("String from utf8 error: {0}")]
    FromUtf8Error(#[from] std::string::FromUtf8Error),

    #[error("IO error: {0}")]
    IOError(#[from] std::io::Error),

    #[error("Toml error: {0}")]
    TomlSerError(#[from] toml::ser::Error),

    #[error("Web error: {0}")]
    WebError(&'static str, StatusCode),
}

impl From<reqwest::Error> for Error {
    fn from(e: reqwest::Error) -> Self {
        match e.status() {
            Some(status) => Error::StatusError(status),
            None => Error::RequestError(e),
        }
    }
}

pub type Result<T, E = Error> = std::result::Result<T, E>;

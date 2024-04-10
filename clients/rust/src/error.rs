#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Reqwest error: {0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("Websocket error: {0}")]
    Websocket(#[from] reqwest_websocket::Error),

    #[error("Failed to parse json: {0}")]
    SerdeJson(#[from] serde_json::Error),

    #[error("Failed to parse object id: {0}")]
    ObjectId(#[from] bson::oid::Error),

    #[error("Failed to parse url: {0}")]
    Url(#[from] url::ParseError),

    #[error("Unsupported url schema, expected `http` or `https`")]
    UrlUnsupportedSchema,

    #[error("Url cannot be a base")]
    UrlCannotBeABase,
}

pub type Result<T, E = Error> = std::result::Result<T, E>;

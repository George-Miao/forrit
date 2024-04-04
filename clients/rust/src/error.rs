#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Reqwest(#[from] reqwest::Error),

    #[error("Failed to parse object id: {0}")]
    ObjectId(#[from] bson::oid::Error),

    #[error("Failed to parse url: {0}")]
    Url(#[from] url::ParseError),

    #[error("Url cannot be a base")]
    UrlCannotBeABase,
}

pub type Result<T, E = Error> = std::result::Result<T, E>;

use thiserror::Error;

#[derive(Error, Debug, Clone, PartialEq, Eq)]
pub enum Error {
    #[error("Url parse error: {0}")]
    UrlParseError(#[from] url::ParseError),
}

pub type Result<T> = std::result::Result<T, Error>;

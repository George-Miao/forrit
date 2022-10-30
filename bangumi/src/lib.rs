mod model;

pub mod endpoints;
pub use model::*;
pub use rustify;

pub const DEFAULT_DOMAIN: &str = "https://bangumi.moe";

use rustify::errors::ClientError as RustifyError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    /// Some endpoints return different data depend on their version
    #[error("Api version error: {0}")]
    Version(String),

    #[error("rustify error: {0}")]
    Rustify(#[from] RustifyError),

    #[error("Search found nothing")]
    NotFound,
}

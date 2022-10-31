//! # Bangumi.moe API
//!
//! This is a Rust library for the Bangumi.moe API based on rustify.
//!
//! ## Usage
//!
//! ```rust
//! # #[tokio::test] async fn doc_test_1() -> Result<(), Box<dyn std::error::Error>>{ use bangumi::*;
//! use bangumi::{endpoints::GetCurrent, Endpoint};
//!
//! let client = bangumi::client();
//! let result: Vec<WithId<Bangumi>> = GetCurrent.exec(&client).await?.parse()?;
//! # Ok(()) }
//! ```
//!
//! ## With builder
//!
//! ```rust
//! # #[tokio::test] async fn doc_test_2() -> Result<(), Box<dyn std::error::Error>>{ use bangumi::*;
//! use bangumi::{endpoints::SearchTags, Endpoint};
//!
//! let client = bangumi::client();
//! let result: SearchResult<Vec<WithId<Tag>>> =
//!     SearchTags::builder()
//!         .name("魔法少女")
//!         .keywords(false)
//!         .tag_type(TagType::Bangumi)
//!         .build()
//!         .exec(&client)
//!         .await?
//!         .parse()?;
//! # Ok(()) }
//! ```
//! For all endpoints, see [endpoints](endpoints/index.html).

mod model;

pub mod endpoints;
pub use model::*;
pub use rustify::{self, Client as ReqwestClient, Endpoint};

pub const DEFAULT_DOMAIN: &str = "https://bangumi.moe";

use rustify::errors::ClientError as RustifyError;
use thiserror::Error;

pub fn client() -> ReqwestClient {
    ReqwestClient::default(DEFAULT_DOMAIN)
}

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

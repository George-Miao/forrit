mod api;
mod error;
mod model;

pub use error::*;
pub use model::*;
use reqwest::Client;

pub const DEFAULT_DOMAIN: &str = "bangumi.moe";

#[derive(Debug, Clone)]
pub struct Api {
    domain: Option<String>,
    client: Client,
}

impl Api {
    #[inline]
    pub fn new() -> Self {
        Self {
            domain: None,
            client: Client::new(),
        }
    }

    #[inline]
    pub fn new_with_client(client: Client) -> Self {
        Self {
            domain: None,
            client,
        }
    }

    #[inline]
    pub fn new_raw(domain: impl Into<Option<String>>, client: Client) -> Self {
        let domain = domain.into();
        Self { domain, client }
    }

    #[inline]
    pub fn with_domain(mut self, domain: impl Into<Option<String>>) -> Self {
        self.domain = domain.into();
        self
    }

    #[inline]
    pub fn domain(&self) -> &str {
        self.domain.as_deref().unwrap_or(DEFAULT_DOMAIN)
    }

    fn get(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .get(&format!("https://{}/api/{}", self.domain(), path))
    }

    fn post(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .post(&format!("https://{}/api/{}", self.domain(), path))
    }

    fn get_v2(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .get(&format!("https://{}/api/v2/{}", self.domain(), path))
    }

    fn post_v2(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .post(&format!("https://{}/api/v2/{}", self.domain(), path))
    }
}

impl Default for Api {
    fn default() -> Self {
        Self::new()
    }
}

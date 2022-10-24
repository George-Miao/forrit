mod api;
mod model;

pub use model::*;
use reqwest::Client;

pub const DEFAULT_DOMAIN: &str = "bangumi.moe";

#[derive(Debug, Clone)]
pub struct Api {
    domain: String,
    client: Client,
}

impl Api {
    pub fn new() -> Self {
        Self {
            domain: DEFAULT_DOMAIN.to_owned(),
            client: Client::new(),
        }
    }

    pub fn new_with_client(client: Client) -> Self {
        Self {
            domain: DEFAULT_DOMAIN.to_owned(),
            client,
        }
    }

    pub fn new_raw(domain: impl Into<String>, client: Client) -> Self {
        let domain = domain.into();
        Self { domain, client }
    }

    pub fn with_domain(mut self, domain: impl Into<String>) -> Self {
        self.domain = domain.into();
        self
    }

    fn get(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .get(&format!("https://{}/api/{}", self.domain, path))
    }

    fn post(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .post(&format!("https://{}/api/{}", self.domain, path))
    }

    fn get_v2(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .get(&format!("https://{}/api/v2/{}", self.domain, path))
    }

    fn post_v2(&self, path: &str) -> reqwest::RequestBuilder {
        self.client
            .post(&format!("https://{}/api/v2/{}", self.domain, path))
    }
}

impl Default for Api {
    fn default() -> Self {
        Self::new()
    }
}

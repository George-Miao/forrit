use governor::DefaultDirectRateLimiter;
use tmdb_api::client::ReqwestClient;

pub struct GovernedClient {
    tmdb: ReqwestClient,
    governor: DefaultDirectRateLimiter,
}

impl GovernedClient {
    pub fn new(tmdb: ReqwestClient, governor: DefaultDirectRateLimiter) -> Self {
        Self { tmdb, governor }
    }

    pub async fn get(&self) -> &ReqwestClient {
        self.governor.until_ready().await;
        &self.tmdb
    }
}

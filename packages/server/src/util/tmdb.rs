use std::sync::Arc;

use governor::DefaultDirectRateLimiter;
use tmdb_api::prelude::Command;

#[derive(Clone)]
pub struct GovernedClient {
    tmdb: tmdb_api::Client,
    governor: Arc<DefaultDirectRateLimiter>,
}

impl GovernedClient {
    pub fn new(tmdb: tmdb_api::Client, governor: Arc<DefaultDirectRateLimiter>) -> Self {
        Self { tmdb, governor }
    }

    pub async fn execute<C: Command + ?Sized>(&self, command: &C) -> Result<C::Output, tmdb_api::error::Error> {
        self.governor.until_ready().await;
        self.tmdb.execute(command.path().as_ref(), command.params()).await
    }
}

pub trait CommandExt: Command {
    async fn execute_with_governor(&self, client: &GovernedClient) -> Result<Self::Output, tmdb_api::error::Error> {
        client.execute(self).await
    }
}

impl<C: Command + ?Sized> CommandExt for C {}

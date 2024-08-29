use futures::Future;
use governor::DefaultDirectRateLimiter;
use tmdb_api::prelude::Command;

pub struct GovernedClient {
    tmdb: tmdb_api::Client,
    governor: DefaultDirectRateLimiter,
}

impl GovernedClient {
    pub fn new(tmdb: tmdb_api::Client, governor: DefaultDirectRateLimiter) -> Self {
        Self { tmdb, governor }
    }

    pub async fn execute<C: Command + ?Sized>(&self, command: &C) -> Result<C::Output, tmdb_api::error::Error> {
        self.governor.until_ready().await;
        self.tmdb.execute(command.path().as_ref(), command.params()).await
    }
}

pub trait CommandExt: Command {
    fn execute_with_governor(
        &self,
        client: &GovernedClient,
    ) -> impl Future<Output = Result<Self::Output, tmdb_api::error::Error>> + Send {
        async { client.execute(self).await }
    }
}

impl<C: Command + ?Sized> CommandExt for C {}

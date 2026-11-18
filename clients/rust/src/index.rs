use forrit_core::model::IndexStat;
use tap::Tap;
use url::Url;

use crate::{ForritClient, ResourceClient, error::Result};

impl ForritClient {
    pub fn index(&self) -> ResourceClient<'_, IndexStat> {
        ResourceClient::new(self)
    }
}

impl<'a> ResourceClient<'a, IndexStat> {
    const ENDPOINT: &'static str = "index";

    fn url(&self) -> Url {
        self.client.endpoint.clone().tap_mut(|url| {
            url.path_segments_mut()
                .expect("url cannot be a base")
                .push(Self::ENDPOINT);
        })
    }

    pub async fn get(&self) -> Result<Option<IndexStat>> {
        self.client
            .client
            .get(self.url())
            .send()
            .await?
            .error_for_status()?
            .json()
            .await
            .map_err(Into::into)
    }

    pub async fn start(&self) -> Result<()> {
        self.client
            .client
            .post(self.url())
            .send()
            .await?
            .error_for_status()?
            .json()
            .await
            .map(|_: IndexStat| ())
            .map_err(Into::into)
    }

    pub async fn stop(&self) -> Result<()> {
        self.client
            .client
            .delete(self.url())
            .send()
            .await?
            .error_for_status()?
            .json()
            .await
            .map(|_: IndexStat| ())
            .map_err(Into::into)
    }
}

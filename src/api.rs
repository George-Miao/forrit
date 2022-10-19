use color_eyre::Result;
use rss::Channel;

use crate::model::Subscription;

pub struct Api {
    client: reqwest::Client,
}

impl Api {
    pub fn new() -> Self {
        Self {
            client: Default::default(),
        }
    }

    pub async fn retreive_rss(&self, sub: &Subscription) -> Result<Channel> {
        let rss = sub.rss_url()?;
        let rss_content = self.client.get(rss).send().await?.bytes().await?;

        let c = Channel::read_from(rss_content.as_ref())?;
        Ok(c)
    }
}

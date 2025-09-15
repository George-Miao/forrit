use forrit_core::model::IndexStat;
use futures::{Stream, StreamExt};
use reqwest_websocket::{Message, RequestBuilderExt};
use tap::{Pipe, Tap};
use url::Url;

use crate::{error::Result, ForritClient, ResourceClient};

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

    fn ws_url(&self) -> Url {
        self.client.endpoint.clone().tap_mut(|url| {
            url.path_segments_mut()
                .expect("url cannot be a base")
                .extend([Self::ENDPOINT, "subscribe"]);
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

    // pub async fn subscribe(&self) -> Result<impl Stream<Item =
    // Result<IndexStat>>> {     self.client
    //         .client
    //         .get(self.ws_url())
    //         .upgrade()
    //         .send()
    //         .await?
    //         .into_websocket()
    //         .await?
    //         .map(|x| {
    //             match x? {
    //                 Message::Text(text) =>
    // serde_json::from_str::<IndexStat>(&text),                 
    // Message::Binary(bytes) => serde_json::from_slice(&bytes),             }
    //             .map_err(Into::into)
    //         })
    //         .pipe(Ok)
    // }
}

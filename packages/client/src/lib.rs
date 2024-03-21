use std::marker::PhantomData;

use bson::oid::ObjectId;
use forrit_core::model::{UpdateResult, WithId};
use reqwest::{Client, Url};

use crate::resource::*;

pub mod error;
mod resource;

use crate::error::Result;

pub struct ForritClient {
    client: Client,
    endpoint: Url,
}

impl ForritClient {
    pub fn new(endpoint: impl TryInto<Url, Error = url::ParseError>) -> Result<Self> {
        let endpoint = endpoint.try_into()?;
        if endpoint.cannot_be_a_base() {
            return Err(error::Error::UrlCannotBeABase);
        }
        Ok(Self {
            client: Client::new(),
            endpoint,
        })
    }

    pub fn with_client(endpoint: Url, client: Client) -> Self {
        Self { client, endpoint }
    }
}

pub struct ResourceClient<'a, R> {
    client: &'a ForritClient,
    _p: PhantomData<R>,
}

impl<'a, R> ResourceClient<'a, R> {
    fn new(client: &'a ForritClient) -> Self {
        Self {
            client,
            _p: PhantomData,
        }
    }

    fn req(&self) -> &Client {
        &self.client.client
    }
}

impl<'a, R: Resource> ResourceClient<'a, R> {
    fn url(&self, id: Option<&ObjectId>) -> Url {
        let mut url = self.client.endpoint.clone();
        let mut seg = url.path_segments_mut().expect("url cannot be a base");
        seg.push(R::NAME);
        if let Some(id) = id {
            seg.push(&id.to_hex());
        }
        drop(seg);
        url
    }

    pub async fn list(&self) -> Result<Vec<WithId<R>>>
    where
        R: List,
    {
        self.req()
            .get(self.url(None))
            .send()
            .await?
            .json()
            .await
            .map_err(Into::into)
    }

    pub async fn create(&self, data: R) -> Result<ObjectId>
    where
        R: Create,
    {
        self.req()
            .post(self.url(None))
            .json(&data)
            .send()
            .await?
            .text()
            .await?
            .parse()
            .map_err(Into::into)
    }

    pub async fn get(&self, id: ObjectId) -> Result<WithId<R>>
    where
        R: Read,
    {
        self.req()
            .get(self.url(Some(&id)))
            .send()
            .await?
            .json()
            .await
            .map_err(Into::into)
    }

    pub async fn update(&self, id: ObjectId, data: R) -> Result<UpdateResult>
    where
        R: Update,
    {
        self.req()
            .put(self.url(Some(&id)))
            .json(&data)
            .send()
            .await?
            .json()
            .await
            .map_err(Into::into)
    }

    pub async fn delete(&self, id: ObjectId) -> Result<WithId<R>>
    where
        R: Delete,
    {
        self.req()
            .delete(self.url(Some(&id)))
            .send()
            .await?
            .json()
            .await
            .map_err(Into::into)
    }
}

#[cfg(test)]
mod test {

    use crate::ForritClient;

    #[tokio::test]
    async fn test_client() {
        let c = ForritClient::new("http://localhost:8080").unwrap();
        let res = c.entry().list().await.unwrap();
        println!("{:#?}", res);
    }
}

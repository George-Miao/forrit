use std::{
    ops::{Deref, DerefMut},
    path::PathBuf,
};

use color_eyre::{
    eyre::{bail, eyre},
    Result,
};
use ejdb::bson::{from_bson, oid::ObjectId, to_bson, Bson, Document};
use regex::Regex;
use reqwest::Url;
use serde::{Deserialize, Serialize};

use crate::{
    bangumi_moe::v2::{Id, Tag, WithId},
    AsDocument,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Subscription {
    pub tags: Vec<Id>,
    pub bangumi_tag: WithId<Tag>,
    pub season: Option<u16>,
    #[serde(with = "serde_regex")]
    pub include_pattern: Option<Regex>,
    #[serde(with = "serde_regex")]
    pub exclude_pattern: Option<Regex>,
}

impl Subscription {
    pub fn rss_url(&self) -> Result<Url> {
        let tags: String = self
            .tags
            .iter()
            .chain(std::iter::once(&self.bangumi_tag.id))
            .map(|x| x.to_string())
            .intersperse("+".to_owned())
            .collect();

        Url::parse(&format!("https://bangumi.moe/rss/tags/{tags}")).map_err(Into::into)
    }

    pub fn with_filter(mut self, tag: Id) -> Self {
        self.tags.push(tag);
        self
    }
}

impl AsDocument for Subscription {
    fn as_document(&self) -> Result<ejdb::bson::Document> {
        let doc = match to_bson(self)? {
            Bson::Document(doc) => doc,
            _ => unreachable!(),
        };
        Ok(doc)
    }
}

impl TryFrom<Document> for Subscription {
    type Error = color_eyre::Report;

    fn try_from(doc: Document) -> Result<Self, Self::Error> {
        from_bson(Bson::Document(doc)).map_err(Into::into)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Job {
    pub url: String,
    pub dir: PathBuf,
    pub filename: String,
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct WithOId<T> {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(flatten)]
    pub data: T,
}

impl<T> Deref for WithOId<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.data
    }
}

impl<T> DerefMut for WithOId<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.data
    }
}

impl<T> WithOId<T> {
    pub fn unwrap(self) -> T {
        self.data
    }
}

use std::path::PathBuf;

use color_eyre::Result;
use ejdb::bson::{from_bson, to_bson, Bson, Document};
use regex::Regex;
use reqwest::Url;
use serde::{Deserialize, Serialize};
use transmission_rpc::types::TorrentAddArgs;

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
    pub url: Url,
    pub dir: PathBuf,
    pub filename: String,
}

impl TryFrom<Job> for TorrentAddArgs {
    type Error = color_eyre::Report;

    fn try_from(val: Job) -> Result<Self> {
        Ok(TorrentAddArgs {
            filename: Some(val.url.to_string()),
            download_dir: Some(
                val.dir
                    .into_os_string()
                    .into_string()
                    .expect("Download dir should be valid utf-8"),
            ),
            ..Default::default()
        })
    }
}

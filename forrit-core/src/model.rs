use std::{ops::Deref, path::PathBuf};

use bangumi::Id;
use regex::Regex;
use serde::{Deserialize, Serialize};
use url::Url;

use crate::Result;

#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subscription {
    pub bangumi: Id,

    #[serde(default)]
    pub tags: Vec<Id>,

    #[serde(default)]
    pub season: Option<u16>, // TODO: possibly use string for season and add resolving function

    #[serde(with = "serde_regex")]
    #[serde(default)]
    pub include_pattern: Option<Regex>,

    #[serde(with = "serde_regex")]
    #[serde(default)]
    pub exclude_pattern: Option<Regex>,
}

impl Subscription {
    pub fn rss_url(&self, domain: &str) -> Result<Url> {
        let tags: String = self
            .tags
            .iter()
            .chain(std::iter::once(&self.bangumi))
            .map(Deref::deref)
            .intersperse("+")
            .collect();

        Url::parse(&format!("https://{domain}/rss/tags/{tags}")).map_err(Into::into)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Job {
    pub url: Url,
    pub dir: PathBuf,
}

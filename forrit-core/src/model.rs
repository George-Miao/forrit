use std::{fmt::Display, ops::Deref, path::PathBuf};

use bangumi::{Id, Record};
use regex::Regex;
use serde::{Deserialize, Serialize};
use unicode_width::UnicodeWidthStr;
use url::Url;

use crate::Result;

#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Subscription {
    /// Tag and name of the bangumi.
    pub bangumi: Record,

    /// Tag and name of the working team
    pub team: Option<Record>,

    /// List of filter tags, language, etc.
    #[serde(default)]
    pub tags: Vec<Id>,

    #[serde(default)]
    pub season: Option<u8>, // TODO: possibly use string for season and add resolving function

    #[serde(with = "serde_regex")]
    #[serde(default)]
    pub include_pattern: Option<Regex>,

    #[serde(with = "serde_regex")]
    #[serde(default)]
    pub exclude_pattern: Option<Regex>,
}

impl Subscription {
    pub fn get_rss_url(&self, domain: &str) -> Result<Url> {
        let tags: String = self.tags().map(|x| x.as_str()).intersperse("+").collect();

        Url::parse(&format!("https://{domain}/rss/tags/{tags}")).map_err(Into::into)
    }

    pub fn tags(&self) -> impl Iterator<Item = &Id> {
        use std::iter;
        iter::once(&self.bangumi.tag)
            .chain(self.team.as_ref().into_iter().map(|x| &x.tag))
            .chain(self.tags.iter())
    }

    /// Properly display CJK names
    pub fn display(&self, padding: usize) -> SubscriptionDisplay {
        SubscriptionDisplay { sub: self, padding }
    }
}

pub struct SubscriptionDisplay<'a> {
    sub: &'a Subscription,
    padding: usize,
}

impl Display for SubscriptionDisplay<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let bangumi = format!(
            "{} S{}",
            self.sub.bangumi.name,
            self.sub.season.unwrap_or(1)
        );
        let width = self.padding - bangumi.width();
        let team = self
            .sub
            .team
            .as_ref()
            .map(|x| x.name.deref().as_str())
            .unwrap_or("");
        write!(f, "{bangumi}{:width$}{team}", "")
    }
}
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Job {
    pub url: Url,
    pub dir: PathBuf,
}

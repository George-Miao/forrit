use std::path::{Path, PathBuf};

use bangumi::{Id, Record};
use regex::Regex;
use serde::{Deserialize, Serialize};
use url::Url;

use crate::Result;

#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BangumiSubscription {
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

impl BangumiSubscription {
    pub fn get_rss_url(&self, base: &str) -> Result<Url> {
        let tags: String = self.tags().map(|x| x.as_str()).intersperse("+").collect();

        Url::parse(&format!("{base}/rss/tags/{tags}")).map_err(Into::into)
    }

    pub fn tags(&self) -> impl Iterator<Item = &Id> {
        use std::iter;
        iter::once(&self.bangumi.tag)
            .chain(self.team.as_ref().into_iter().map(|x| &x.tag))
            .chain(self.tags.iter())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Job {
    pub id: String,
    pub url: Url,
    pub dir: PathBuf,
}

impl Job {
    pub fn with_download_dir(&mut self, root: &Path) {
        self.dir = root.join(&self.dir);
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Confirm {
    pub success: bool,
}

impl Default for Confirm {
    fn default() -> Self {
        Self { success: true }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum Event {
    JobAdded(Job),
    DownloadStart {
        url: Url,
    },
    Warn(String),
    SubscriptionAdded(BangumiSubscription),
    SubscriptionUpdated {
        old: BangumiSubscription,
        new: BangumiSubscription,
    },
    SubscriptionRemoved(BangumiSubscription),
    MultipleSubscriptionRemoved(Vec<String>),
}

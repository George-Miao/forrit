use std::{
    borrow::Cow,
    path::{Path, PathBuf},
    sync::LazyLock,
};

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
    pub season: Option<u8>,

    #[serde(default)]
    pub dir: Option<String>,

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

pub fn normalize_title(title: &str) -> Cow<'_, str> {
    macro_rules! rule {
        ($reg:literal) => {
            Regex::new($reg).expect("Regex should compile")
        };
    }
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            rule!(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#),
            rule!(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#),
        ]
    });

    PATTERNS
        .iter()
        .find_map(|pat| {
            pat.captures(title).and_then(|cap| {
                let pre = cap.get(1)?.as_str().trim();
                let episode = cap.get(2)?.as_str().trim();
                let suf = cap.get(3)?.as_str().trim();

                Some(format!("{pre} E{episode} {suf}").into())
            })
        })
        .unwrap_or_else(|| title.into())
}

#[test]
fn test() {
    println!("{}", u16::MAX)
}

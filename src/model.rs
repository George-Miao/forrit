use color_eyre::Result;
use serde::{Deserialize, Serialize};

use crate::bangumi_moe::{Tag, ID};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Subscribed {
    pub tags: Vec<ID>,
    pub bangumi_tag: Tag,
    pub season: Option<u16>,
}

impl Subscribed {
    pub fn rss_url_v1(&self) -> Result<url::Url> {
        let tags: String = self
            .tags
            .iter()
            .chain(std::iter::once(&self.bangumi_tag.id))
            .map(|x| x.0.as_str())
            .intersperse("+")
            .collect();

        url::Url::parse(&format!("https://bangumi.moe/rss/tags/{tags}")).map_err(Into::into)
    }

    pub fn add_filter(&mut self, tag: ID) {
        self.tags.push(tag);
    }
}

use std::ops::{Deref, DerefMut};

use color_eyre::Result;
use ejdb::bson::oid::ObjectId;
use reqwest::Url;
use serde::{Deserialize, Serialize};

use crate::bangumi_moe::v2::{Id, Tag, WithId};

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Subscription {
    pub tags: Vec<Id>,
    pub bangumi_tag: WithId<Tag>,
    pub season: Option<u16>,
    pub include_pattern: Option<String>,
    pub exclude_pattern: Option<String>,
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

#[tokio::test]
async fn test_rss_url() -> Result<()> {
    use std::fs;

    use crate::{api::Api, bangumi_moe::v2::Current};

    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id.deref() == "62c6ce11f248710007e811b1")
        .unwrap()
        .unwrap();

    let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

    let sub = Subscription {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
        include_pattern: None,
        exclude_pattern: None,
    };

    let c = Api::new();
    let res = c.retreive_rss(&sub).await?;
    println!("res: {:#?}", res);
    for item in res
        .items
        .into_iter()
        .filter(|x| x.enclosure.is_some() && x.title.is_some())
    {
        println!("Name: {}", item.title.unwrap());
        println!("Magnet: {}", item.enclosure.unwrap().url);
    }
    Ok(())
}

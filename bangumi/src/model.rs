use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
};

use serde::{Deserialize, Serialize};

use crate::Error;

microtype::microtype! {
    #[derive(Clone, Debug, Default, Hash, PartialEq, Eq, PartialOrd, Ord)]
    pub String {
        Id,
        Name
    }
}

macro_rules! impl_display {
    ($i:ident) => {
        impl ::std::fmt::Display for $i {
            fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }
    };
}

impl_display!(Id);
impl_display!(Name);

#[derive(Debug, Clone)]
pub enum SearchResult<T> {
    Found(T),
    None,
}

impl<T> SearchResult<T> {
    pub fn is_found(&self) -> bool {
        matches!(self, SearchResult::Found(_))
    }

    pub fn is_none(&self) -> bool {
        matches!(self, SearchResult::None)
    }

    pub fn unwrap(self) -> T {
        match self {
            SearchResult::Found(t) => t,
            SearchResult::None => panic!("Unwrap on `SearchResult::None`"),
        }
    }

    pub fn resolve(self) -> Result<T, Error> {
        match self {
            SearchResult::Found(t) => Ok(t),
            SearchResult::None => Err(Error::NotFound),
        }
    }
}

mod __de {
    use serde::{de::Visitor, Deserialize};

    use crate::SearchResult;

    struct SearchResultVisitor<'de, T>(std::marker::PhantomData<&'de T>);

    impl<'de, T> Visitor<'de> for SearchResultVisitor<'de, T>
    where
        T: Deserialize<'de>,
    {
        type Value = SearchResult<T>;

        fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
            formatter.write_str("a search result")
        }

        fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
        where
            A: serde::de::MapAccess<'de>,
        {
            while let Some(key) = map.next_key()? {
                match key {
                    "found" | "success" => {
                        if !map.next_value::<bool>()? {
                            return Ok(SearchResult::None);
                        }
                    }
                    _ => return Ok(SearchResult::Found(map.next_value()?)),
                }
            }
            Ok(SearchResult::None)
        }
    }

    impl<'de, T> serde::Deserialize<'de> for super::SearchResult<T>
    where
        T: serde::Deserialize<'de> + 'de,
    {
        fn deserialize<D>(deserializer: D) -> serde::__private::Result<Self, D::Error>
        where
            D: serde::Deserializer<'de>,
        {
            deserializer.deserialize_map(SearchResultVisitor(std::marker::PhantomData))
        }
    }
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Bangumi {
    pub name: String,
    pub credit: String,
    #[serde(rename = "startDate")]
    pub start_date: u64,
    #[serde(rename = "endDate")]
    pub end_date: u64,
    #[serde(rename = "showOn")]
    pub show_on: u64,
    pub tag_id: Id,
    pub icon: String,
    pub cover: String,
    pub acgdb_id: Option<String>,
    /// Only exist on v2 api
    pub tag: Option<WithId<Tag>>,
}

impl WithId<Bangumi> {
    pub fn into_record(self) -> Option<WithId<Name>> {
        Some(WithId {
            data: self.tag.as_ref()?.inner().preferred_name_owned(),
            id: self.into_inner().tag_id,
        })
    }

    pub fn as_record(&self) -> Option<WithId<Name>> {
        Some(WithId {
            data: self.tag.as_ref()?.inner().preferred_name_owned(),
            id: self.inner().tag_id.clone(),
        })
    }
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Tag {
    pub name: String,
    #[serde(rename = "type")]
    pub tag_type: TagType,
    #[serde(default)]
    pub synonyms: Vec<String>,
    #[serde(default)]
    pub syn_lowercase: Vec<String>,
    pub activity: i64,
    pub locale: Locale,
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TagType {
    Lang,
    Resolution,
    Format,
    Bangumi,
    Team,
    Misc,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Team {
    pub name: String,
    pub tag_id: Id,
    pub signature: Option<String>,
    pub icon: Option<String>,
    pub admin_id: Option<Id>,
    #[serde(default)]
    pub admin_ids: Vec<Id>,
    #[serde(default)]
    pub editor_ids: Vec<Id>,
    #[serde(default)]
    pub member_ids: Vec<Id>,
    #[serde(default)]
    pub auditing_ids: Vec<Id>,
    #[serde(rename = "regDate")]
    pub reg_date: String,
    pub approved: bool,
    pub tag: WithId<Tag>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Current {
    pub bangumis: Vec<WithId<Bangumi>>,
    pub working_teams: HashMap<Id, Vec<WithId<Team>>>,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Locale {
    pub ja: Option<String>,
    pub zh_tw: Option<String>,
    pub en: Option<String>,
    pub zh_cn: Option<String>,
}

impl Tag {
    pub fn preferred_name(&self) -> &str {
        self.locale
            .zh_cn
            .as_ref()
            .or(self.locale.zh_tw.as_ref())
            .or(self.locale.en.as_ref())
            .or(self.locale.ja.as_ref())
            .unwrap_or(&self.name)
    }

    pub fn preferred_name_owned(&self) -> Name {
        self.preferred_name().to_owned().into()
    }
}

#[derive(Clone, Debug, Default, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct WithId<T> {
    #[serde(rename = "_id")]
    pub id: Id,
    #[serde(flatten)]
    pub data: T,
}

impl<T> Deref for WithId<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.data
    }
}

impl<T> DerefMut for WithId<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.data
    }
}

impl<T> WithId<T> {
    pub fn new(id: Id, data: T) -> Self {
        Self { id, data }
    }

    pub fn inner(&self) -> &T {
        &self.data
    }

    pub fn into_inner(self) -> T {
        self.data
    }

    pub fn map<R>(self, f: impl FnOnce(T) -> R) -> WithId<R> {
        WithId {
            id: self.id,
            data: f(self.data),
        }
    }

    // pub fn into_oid(self) -> Result<WithOId<T>> {
    //     Ok(WithOId {
    //         id: self.id.to_oid()?,
    //         data: self.data,
    //     })
    // }
}

#[derive(Clone, Debug, Default, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct Record {
    pub tag: Id,
    pub name: Name,
}

impl From<WithId<Tag>> for Record {
    fn from(tag: WithId<Tag>) -> Self {
        Self {
            name: tag.preferred_name_owned(),
            tag: tag.id,
        }
    }
}

impl From<&WithId<Tag>> for Record {
    fn from(tag: &WithId<Tag>) -> Self {
        Self {
            name: tag.preferred_name_owned(),
            tag: tag.id.to_owned(),
        }
    }
}

impl TryFrom<WithId<Bangumi>> for Record {
    type Error = Error;

    fn try_from(bangumi: WithId<Bangumi>) -> Result<Self, Self::Error> {
        Ok(Self {
            name: bangumi
                .tag
                .as_ref()
                .ok_or_else(|| Error::Version("v1 api does not have `tag` field".into()))?
                .preferred_name_owned(),
            tag: bangumi.into_inner().tag_id,
        })
    }
}

impl TryFrom<&WithId<Bangumi>> for Record {
    type Error = Error;

    fn try_from(bangumi: &WithId<Bangumi>) -> Result<Self, Self::Error> {
        Ok(Self {
            name: bangumi
                .tag
                .as_ref()
                .ok_or_else(|| Error::Version("v1 api does not have `tag` field".into()))?
                .preferred_name_owned(),
            tag: bangumi.tag_id.to_owned(),
        })
    }
}

impl From<WithId<Team>> for Record {
    fn from(team: WithId<Team>) -> Self {
        Self {
            name: team.tag.preferred_name_owned(),
            tag: team.into_inner().tag_id,
        }
    }
}

impl From<&WithId<Team>> for Record {
    fn from(team: &WithId<Team>) -> Self {
        Self {
            name: team.tag.preferred_name_owned(),
            tag: team.tag_id.to_owned(),
        }
    }
}

// Example code that deserializes and serializes the model.
// extern crate serde;
// #[macro_use]
// extern crate serde_derive;
// extern crate serde_json;
//
// use generated_module::[object Object];
//
// fn main() {
//     let json = r#"{"answer": 42}"#;
//     let model: [object Object] = serde_json::from_str(&json).unwrap();
// }

#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Torrent {
    #[serde(rename = "_id")]
    pub id: Id,
    pub category_tag_id: Id,
    pub title: String,
    pub introduction: String,
    pub tag_ids: Vec<Id>,

    #[serde(default)]
    pub comments: i64,

    #[serde(default)]
    pub downloads: i64,

    #[serde(default)]
    pub finished: i64,

    #[serde(default)]
    pub leechers: i64,

    #[serde(default)]
    pub seeders: i64,
    pub uploader_id: Id,

    #[serde(default)]
    pub team_id: Option<Id>,
    pub publish_time: Id,
    pub magnet: String,
    #[serde(rename = "infoHash")]
    pub info_hash: String,
    pub file_id: Id,
    #[serde(default)]
    pub teamsync: Option<bool>,
    pub content: Vec<Content>,
    pub size: Option<String>,
    pub btskey: Option<String>,
    #[serde(default)]
    pub sync: Sync,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Torrents {
    pub torrents: Vec<Torrent>,
    pub count: i64,
    pub page_count: i64,
}

#[derive(Debug, Clone, Default, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Sync {
    pub dmhy: Option<String>,
    pub acgrip: Option<String>,
    pub acgnx: Option<String>,
    pub acgnx_int: Option<String>,
    pub nyaa: Option<String>,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Content {
    Tuple([String; 2]),
    Name(String),
}

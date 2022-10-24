use std::{
    collections::HashMap,
    fmt::Display,
    ops::{Deref, DerefMut},
};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[repr(transparent)]
pub struct Id(pub String);

impl Id {
    // pub fn to_oid(&self) -> Result<ObjectId> {
    //     Ok(ObjectId::with_string(&self.0)?)
    // }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl Display for Id {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl Deref for Id {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Debug, Clone)]
pub enum SearchResult<T> {
    Found(T),
    None,
}

#[doc(hidden)]
mod __de {
    use serde::{de::Visitor, Deserialize};

    use crate::bangumi_moe::SearchResult;

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
    Resolution,
    Bangumi,
    Team,
    Format,
    Lang,
    #[serde(other)]
    Unknown,
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
}

#[derive(Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
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
    pub fn unwrap(self) -> T {
        self.data
    }

    pub fn inner(&self) -> &T {
        &self.data
    }

    // pub fn into_oid(self) -> Result<WithOId<T>> {
    //     Ok(WithOId {
    //         id: self.id.to_oid()?,
    //         data: self.data,
    //     })
    // }
}

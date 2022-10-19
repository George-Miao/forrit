use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
};

use color_eyre::Result;
use ejdb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

use crate::model::WithOId;

#[derive(Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[repr(transparent)]
pub struct Id(pub String);

impl Id {
    pub fn to_oid(&self) -> Result<ObjectId> {
        Ok(ObjectId::with_string(&self.0)?)
    }
}

impl Deref for Id {
    type Target = str;

    fn deref(&self) -> &Self::Target {
        &self.0
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
    pub tag: WithId<Tag>,
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
    pub fn get_preferred_name(&self) -> &str {
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

    pub fn into_oid(self) -> Result<WithOId<T>> {
        Ok(WithOId {
            id: self.id.to_oid()?,
            data: self.data,
        })
    }
}

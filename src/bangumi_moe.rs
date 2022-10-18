use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[repr(transparent)]
pub struct ID(pub String);

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Bangumi {
    #[serde(rename = "_id")]
    pub id: ID,
    pub name: String,
    pub credit: String,
    #[serde(rename = "startDate")]
    pub start_date: u64,
    #[serde(rename = "endDate")]
    pub end_date: u64,
    #[serde(rename = "showOn")]
    pub show_on: u64,
    pub tag_id: ID,
    pub icon: String,
    pub cover: String,
    pub acgdb_id: Option<String>,
    pub tag: Tag,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Tag {
    #[serde(rename = "_id")]
    pub id: ID,
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

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Team {
    #[serde(rename = "_id")]
    pub id: ID,
    pub name: String,
    pub tag_id: ID,
    pub signature: Option<String>,
    pub icon: Option<String>,
    pub admin_id: Option<ID>,
    #[serde(default)]
    pub admin_ids: Vec<ID>,
    #[serde(default)]
    pub editor_ids: Vec<ID>,
    #[serde(default)]
    pub member_ids: Vec<ID>,
    #[serde(default)]
    pub auditing_ids: Vec<ID>,
    #[serde(rename = "regDate")]
    pub reg_date: String,
    pub approved: bool,
    pub tag: Tag,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Current {
    pub bangumis: Vec<Bangumi>,
    pub working_teams: HashMap<String, Vec<Team>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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

use std::collections::BTreeMap;

use bangumi_data::{Broadcast, ItemType, Language, Site};
use bson::oid::ObjectId;
use camino::Utf8PathBuf;
use salvo_oapi::ToSchema;
use serde::{Deserialize, Serialize};
use tmdb_api::tvshow::{SeasonShort, TVShowShort};
use ts_rs::TS;
use url::Url;

pub type Alias = Record<String, ObjectId>;
pub type DateTime = chrono::DateTime<chrono::FixedOffset>;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export)]
#[ts(concrete(V = OidExtJson))]
pub struct Record<K, V> {
    pub key: K,
    pub value: V,
}

#[derive(TS)]
#[ts(export)]
#[ts(rename = "Alias")]
pub struct AliasTs {
    pub key: String,
    pub value: OidExtJson,
}

#[derive(TS)]
#[ts(export)]
#[ts(rename = "ObjectId")]
pub struct OidExtJson {
    #[ts(rename = "$oid", as = "String")]
    _oid: ObjectId,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct WithId<T> {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(flatten)]
    pub inner: T,
}

pub struct ObjectIdSchema;

/// Metadata of a bangumi season
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Meta {
    pub title: String,

    pub title_translate: BTreeMap<Language, Vec<String>>,

    #[serde(rename = "type")]
    #[salvo(schema(value_type = String))]
    pub item_type: ItemType,

    #[salvo(schema(value_type = String))]
    pub lang: Language,

    pub official_site: String,

    #[salvo(schema(value_type = Vec<Object>))]
    pub sites: Vec<Site>,

    #[salvo(schema(value_type = Option<Object>))]
    pub broadcast: Option<Broadcast>,

    pub comment: Option<String>,

    #[ts(skip)]
    pub bson_begin: Option<bson::DateTime>,

    #[ts(skip)]
    pub bson_end: Option<bson::DateTime>,

    pub begin: Option<DateTime>,

    pub end: Option<DateTime>,

    #[salvo(schema(value_type = Option<Object>))]
    pub tv: Option<TVShowShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season: Option<SeasonShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season_override: Option<SeasonOverride>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SeasonOverride {
    pub name: String,
    pub number: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct EntryBase {
    pub guid: String,
    pub title: String,
    pub description: Option<String>,
    pub torrent: Url,
    pub pub_date: Option<DateTime>,
    pub link: Option<Url>,
    pub group: Option<String>,
    pub elements: BTreeMap<String, String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct PartialEntry {
    #[serde(flatten)]
    pub base: EntryBase,

    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<OidExtJson>")]
    pub meta_id: Option<ObjectId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Entry {
    #[serde(flatten)]
    pub base: EntryBase,
    #[salvo(schema(value_type = ObjectIdSchema))]
    #[ts(as = "OidExtJson")]
    pub meta_id: ObjectId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Job {
    #[salvo(schema(value_type = ObjectIdSchema))]
    #[ts(as = "OidExtJson")]
    pub meta_id: ObjectId,
    pub entry: Entry,
    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<String>")]
    pub directory_override: Option<Utf8PathBuf>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Subscription {
    #[salvo(schema(value_type = ObjectIdSchema))]
    #[ts(as = "OidExtJson")]
    pub meta_id: ObjectId,
    pub include: Option<String>,
    pub exclude: Option<String>,
    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<String>")]
    pub directory: Option<Utf8PathBuf>,
    pub team: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Deserialize, serde::Serialize, ToSchema, TS)]
#[ts(export)]
pub struct UpdateResult {
    pub updated: bool,
}
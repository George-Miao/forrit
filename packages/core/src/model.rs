use std::collections::BTreeMap;

use bangumi_data::{Broadcast, ItemType, Language, Site};
use bson::oid::ObjectId;
use camino::Utf8PathBuf;
use chrono::Utc;
use salvo_oapi::ToSchema;
use serde::{Deserialize, Serialize};
use tmdb_api::tvshow::{SeasonShort, TVShowShort};
use ts_rs::TS;
use url::Url;

pub use crate::date::YearMonth;

pub type Alias = Record<String, ObjectId>;
pub type DateTime<Tz = chrono::FixedOffset> = chrono::DateTime<Tz>;

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

    pub begin: Option<DateTime>,

    pub end: Option<DateTime>,

    #[salvo(schema(value_type = Option<Object>))]
    pub tv: Option<TVShowShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season: Option<SeasonShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season_override: Option<SeasonOverride>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct BsonMeta {
    pub begin: Option<bson::DateTime>,

    pub end: Option<bson::DateTime>,

    #[serde(flatten)]
    pub inner: Meta,
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

#[derive(Debug, Clone, Default, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct IndexArg {
    /// Force re-indexing even if the item already exists
    #[serde(default)]
    pub force: bool,

    /// Maximum number of items to index
    #[serde(default)]
    pub max: Option<usize>,

    /// Only index items after this date
    #[serde(default)]
    pub after: Option<YearMonth>,

    /// Only index items before this date
    #[serde(default)]
    pub before: Option<YearMonth>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct IndexStat {
    /// Indexing argument
    pub arg: IndexArg,

    /// Number of items from bangumi data
    pub num_items: u32,

    /// Number of non-TV items
    pub num_non_tv: u32,

    /// Number of items filtered out
    pub num_filtered: u32,

    /// Number of new items added
    pub num_new: u32,

    /// Number of updated items. Only update when force is set to true.
    pub num_updated: u32,

    /// Number of items unchanged.
    pub num_unchanged: u32,

    /// Time when the indexing started
    pub start_at: DateTime<Utc>,

    /// Time when the indexing ended
    pub end_at: Option<DateTime<Utc>>,
}

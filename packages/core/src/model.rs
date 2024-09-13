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

use crate::date::YearMonth;

pub type Alias = Record<String, ObjectId>;
pub type DateTime<Tz = chrono::FixedOffset> = chrono::DateTime<Tz>;

#[cfg(feature = "mongodb_pagination")]
pub use mongodb_pagination::*;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export)]
#[ts(concrete(V = OidExtJson))]
pub struct Record<K, V> {
    pub key: K,
    pub value: V,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub enum DirectedCursor {
    /// Use to invert the search e.g. go back a page
    Backwards(String),
    /// Normal direction to search
    Forward(String),
}

#[derive(Clone, Debug, Deserialize, Serialize, Default, ToSchema, TS)]
#[ts(export)]
pub struct PageInfo {
    /// True if there is a previous page which contains items
    pub has_previous_page: bool,
    /// True if there is a next page which contains items
    pub has_next_page: bool,
    /// Cursor to the first item of the page. Is set even when there is no
    /// previous page.
    pub start_cursor: Option<DirectedCursor>,
    /// Cursor to the last item of the page. Is set even when there is no next
    /// page.
    pub end_cursor: Option<DirectedCursor>,
}

#[derive(Clone, Debug, Deserialize, Serialize, Default, TS)]
#[ts(export)]
pub struct ListResult<T> {
    pub total_count: u64,
    pub page_info: PageInfo,
    pub items: Vec<T>,
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
pub struct ObjectIdStringSchema;

/// Metadata of a bangumi season
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Meta {
    pub title: String,

    #[ts(type = "Record<Language, Array<string>>")]
    pub title_translate: BTreeMap<Language, Vec<String>>,

    #[serde(rename = "type")]
    #[salvo(schema(value_type = String))]
    pub item_type: ItemType,

    #[salvo(schema(value_type = String))]
    pub lang: Language,

    pub official_site: String,

    #[salvo(schema(value_type = Vec<Object>))]
    pub sites: Vec<Site>,

    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<String>")]
    pub broadcast: Option<Broadcast>,

    pub comment: Option<String>,

    pub begin: Option<DateTime>,

    pub end: Option<DateTime>,

    pub subscription: Option<Subscription>,

    #[salvo(schema(value_type = Option<Object>))]
    pub tv: Option<TVShowShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season: Option<SeasonShort>,

    #[salvo(schema(value_type = Option<Object>))]
    pub season_override: Option<SeasonOverride>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BsonMeta {
    pub bson_begin: Option<bson::DateTime>,

    pub bson_end: Option<bson::DateTime>,

    pub tv_id: Option<u64>,

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
    pub sourcer: String,
    pub guid: String,
    pub title: String,
    pub description: Option<String>,
    pub torrent: Url,
    pub size: u64,
    pub mime_type: String,
    pub pub_date: Option<DateTime>,
    pub link: Option<Url>,
    pub group: Option<String>,
    pub elements: BTreeMap<String, String>,

    #[salvo(schema(value_type = Option<ObjectIdSchema>))]
    #[ts(as = "Option<OidExtJson>")]
    pub download_id: Option<ObjectId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct PartialEntry {
    #[serde(flatten)]
    pub base: EntryBase,

    pub meta_title: Option<String>,

    #[salvo(schema(value_type = Option<ObjectIdSchema>))]
    #[ts(as = "Option<OidExtJson>")]
    pub meta_id: Option<ObjectId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BsonEntry {
    pub bson_pub_date: Option<bson::DateTime>,

    #[serde(flatten)]
    pub inner: PartialEntry,
}

/// Resolved entry with metadata
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Entry {
    #[serde(flatten)]
    pub base: EntryBase,

    pub meta_title: String,

    #[salvo(schema(value_type = ObjectIdSchema))]
    #[ts(as = "OidExtJson")]
    pub meta_id: ObjectId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
#[serde(rename_all = "lowercase")]
pub enum DownloadState {
    Pending,
    Downloading,
    Finished,
    Failed,
}

impl DownloadState {
    pub fn to_str(&self) -> &'static str {
        match self {
            DownloadState::Pending => "pending",
            DownloadState::Downloading => "downloading",
            DownloadState::Finished => "finished",
            DownloadState::Failed => "failed",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Download {
    #[salvo(schema(value_type = Option<ObjectIdSchema>))]
    #[ts(as = "Option<OidExtJson>")]
    pub meta_id: Option<ObjectId>,

    #[salvo(schema(value_type = Option<ObjectIdSchema>))]
    #[ts(as = "Option<OidExtJson>")]
    pub subscription_id: Option<ObjectId>,

    #[salvo(schema(value_type = ObjectIdSchema))]
    #[ts(as = "OidExtJson")]
    pub entry_id: ObjectId,

    pub state: DownloadState,

    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<String>")]
    pub directory_override: Option<Utf8PathBuf>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct Subscription {
    #[salvo(schema(value_type = Option<String>))]
    #[ts(as = "Option<String>")]
    pub directory: Option<Utf8PathBuf>,

    // Group subscription
    pub groups: SubscribeGroups,

    // Filters
    /// Include the entry if it matches include regex
    pub include: Option<String>,
    /// Exclude the entry if it matches include regex (overrides include)
    pub exclude: Option<String>,
    /// Exclude the entry if it's smaller than min_size
    pub min_size: Option<u64>, // TODO: Implement size filter
    /// Exclude the entry if it's bigger than max_size
    pub max_size: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
#[serde(rename_all = "lowercase")]
pub enum SubscribeGroups {
    /// Subscribe to all groups
    All,
    #[serde(untagged)]
    Groups(Vec<String>),
}

#[test]
fn test_subscribe_group() {
    let g = SubscribeGroups::All;
    assert_eq!(serde_json::to_string(&g).unwrap(), r#""all""#);
    let g = SubscribeGroups::Groups(vec!["a".to_string(), "b".to_string()]);
    assert_eq!(serde_json::to_string(&g).unwrap(), r#"["a","b"]"#);
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Deserialize, serde::Serialize, ToSchema, TS)]
#[ts(export)]
pub struct UpdateResult {
    pub updated: bool,
}

#[derive(Debug, Clone, Default, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
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

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
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

#[cfg(feature = "mongodb_pagination")]
mod mongodb_pagination {
    use mongodb_cursor_pagination::Edge;
    use salvo_oapi::{ToParameters, ToSchema};
    use ts_rs::TS;

    #[derive(Debug, Clone, serde::Deserialize, ToSchema, ToParameters, TS)]
    #[salvo(parameters(default_parameter_in = Query))]
    #[ts(export)]
    pub struct ListParam {
        /// Number of items in a page
        #[salvo(parameter(default = "20"))]
        #[serde(default = "default_per_page")]
        #[ts(optional, as = "Option<u32>")]
        pub per_page: u32,

        /// Direction to search
        #[salvo(parameter(default = "forward"))]
        #[serde(default)]
        #[ts(optional, as = "Option<Direction>")]
        pub direction: Direction,

        /// Cursor to start searching, if not set, search from the beginning
        #[salvo(parameter(value_type = Option<String>), schema(value_type = Option<String>))]
        #[ts(optional, as = "Option<String>")]
        pub cursor: Option<Edge>,
    }

    impl Default for ListParam {
        fn default() -> Self {
            Self {
                per_page: default_per_page(),
                direction: Direction::Forward,
                cursor: None,
            }
        }
    }

    fn default_per_page() -> u32 {
        20
    }

    #[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default, ToSchema, TS)]
    #[serde(rename_all = "lowercase")]
    #[ts(export)]
    pub enum Direction {
        #[default]
        Forward,
        Backwards,
    }
}

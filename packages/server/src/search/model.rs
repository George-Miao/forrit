use std::ops::{Deref, DerefMut};

use forrit_core::model::{Alias, Meta, PartialEntry, WithId};
use mongodb::bson;
use salvo::oapi::ToSchema;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct Grams {
    pub one: Vec<String>,
    pub two: Vec<String>,
    pub three: Vec<String>,
}

impl Grams {
    pub(crate) fn merge(&mut self, other: Self) {
        self.one.extend(other.one);
        self.two.extend(other.two);
        self.three.extend(other.three);
        self.finish();
    }

    fn finish(&mut self) {
        self.one.sort_unstable();
        self.one.dedup();
        self.two.sort_unstable();
        self.two.dedup();
        self.three.sort_unstable();
        self.three.dedup();
    }
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct MetaMaterial {
    pub titles: Grams,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct EntryMaterial {
    pub title: Grams,
    pub parsed_title: Grams,
    pub torrent_name: Grams,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct AliasMaterial {
    pub key: Grams,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BsonMeta {
    pub bson_begin: Option<bson::DateTime>,
    pub bson_end: Option<bson::DateTime>,
    pub tv_id: Option<u64>,

    #[serde(default, rename = "_search")]
    pub(crate) search: MetaMaterial,

    #[serde(flatten)]
    pub inner: Meta,
}

impl Deref for BsonMeta {
    type Target = Meta;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl DerefMut for BsonMeta {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl From<BsonMeta> for Meta {
    fn from(meta: BsonMeta) -> Self {
        meta.inner
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct BsonEntry {
    pub bson_pub_date: Option<bson::DateTime>,

    #[serde(default, rename = "_search")]
    pub(crate) search: EntryMaterial,

    #[serde(flatten)]
    pub inner: PartialEntry,
}

impl Deref for BsonEntry {
    type Target = PartialEntry;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl From<BsonEntry> for PartialEntry {
    fn from(entry: BsonEntry) -> Self {
        entry.inner
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct BsonAlias {
    #[serde(default, rename = "_search")]
    pub(crate) search: AliasMaterial,

    #[serde(flatten)]
    pub inner: Alias,
}

impl Deref for BsonAlias {
    type Target = Alias;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl From<BsonAlias> for Alias {
    fn from(alias: BsonAlias) -> Self {
        alias.inner
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum MatchKind {
    Exact,
    Prefix,
    Substring,
    Terms,
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum MatchField {
    MetaTitle,
    TmdbName,
    Alias,
    EntryTitle,
    ParsedTitle,
    TorrentName,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, ToSchema)]
pub struct SearchMatch {
    pub kind: MatchKind,
    pub field: MatchField,
    pub text: String,
    pub fragments: Vec<String>,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
pub struct SearchEntryHit {
    pub entry: WithId<PartialEntry>,
    pub matched_by: Option<SearchMatch>,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
pub struct SearchMetaGroup {
    pub meta: WithId<Meta>,
    pub matched_by: Option<SearchMatch>,
    pub entries: Vec<SearchEntryHit>,
    pub matching_entry_count: u64,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
pub struct SearchMetaPage {
    pub items: Vec<SearchMetaGroup>,
    pub next_cursor: Option<String>,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
pub struct SearchEntryPage {
    pub items: Vec<SearchEntryHit>,
    pub next_cursor: Option<String>,
}

#[derive(Clone, Debug, Serialize, ToSchema)]
pub struct SearchResult {
    pub metadata: Option<SearchMetaPage>,
    pub unmatched_entries: Option<SearchEntryPage>,
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum SearchSection {
    Metadata,
    Unmatched,
}

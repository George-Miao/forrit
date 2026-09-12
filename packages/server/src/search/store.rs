use std::{cmp::Ordering, collections::HashMap};

use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use forrit_core::model::{Alias, ListParam, ListResult, Meta, PartialEntry, WithId};
use futures::TryStreamExt;
use mongodb::{
    Collection, IndexModel,
    bson::{self, Bson, Document, doc, oid::ObjectId},
    options::{IndexOptions, UpdateModifications, UpdateOptions},
};
use serde::{Deserialize, Serialize, de::DeserializeOwned};

use super::{
    model::{
        BsonAlias, BsonEntry, BsonMeta, SearchEntryHit, SearchEntryPage, SearchMetaGroup, SearchMetaPage, SearchResult,
        SearchSection,
    },
    text::{MatchRank, MaterializeError, Query, QueryError, RankedMatch, match_alias, match_entry, match_meta},
};
use crate::db::{CrudError, CrudResult, Idx, Resource, Storage, Wrapping};

const SUGGESTION_META_LIMIT: usize = 5;
const SUGGESTION_ENTRY_LIMIT: usize = 5;
const SUGGESTION_PREVIEW_LIMIT: usize = 2;
const PAGE_LIMIT: usize = 20;
const PAGE_PREVIEW_LIMIT: usize = 3;

#[derive(Debug)]
struct Page<C> {
    after: Option<C>,
    limit: usize,
}

#[derive(Debug, Deserialize, Eq, PartialEq, Serialize)]
struct MetaCursor {
    rank: MatchRank,
    latest: i64,
    id: ObjectId,
}

#[derive(Debug, Deserialize, Eq, PartialEq, Serialize)]
struct EntryCursor {
    rank: MatchRank,
    time: i64,
    id: ObjectId,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum Cursor {
    Metadata(MetaCursor),
    Entry(EntryCursor),
}

#[derive(Debug, thiserror::Error)]
pub enum SearchError {
    #[error(transparent)]
    Query(#[from] QueryError),

    #[error("invalid search cursor")]
    InvalidCursor,

    #[error(transparent)]
    Database(#[from] mongodb::error::Error),

    #[error(transparent)]
    Decode(#[from] bson::de::Error),
}

#[derive(Clone, Debug)]
pub struct Search {
    meta: Collection<WithId<Meta>>,
    entry: Collection<WithId<PartialEntry>>,
    alias: Collection<WithId<Alias>>,
}

impl Search {
    pub fn new(
        meta: Collection<WithId<Meta>>,
        entry: Collection<WithId<PartialEntry>>,
        alias: Collection<WithId<Alias>>,
    ) -> Self {
        Self { meta, entry, alias }
    }

    pub async fn ensure_indexes(&self) -> mongodb::error::Result<()> {
        self.meta
            .create_indexes(gram_indexes("_search.titles", "search_meta_titles"), None)
            .await?;
        self.alias
            .create_indexes(gram_indexes("_search.key", "search_alias_key"), None)
            .await?;

        let mut entry_indexes = Vec::with_capacity(10);
        entry_indexes.extend(gram_indexes("_search.title", "search_entry_title"));
        entry_indexes.extend(gram_indexes("_search.parsed_title", "search_entry_parsed_title"));
        entry_indexes.extend(gram_indexes("_search.torrent_name", "search_entry_torrent_name"));
        entry_indexes.push(
            IndexModel::builder()
                .keys(doc! { "meta_id": 1, "bson_pub_date": -1, "_id": -1 })
                .options(
                    IndexOptions::builder()
                        .name("search_entry_recent_by_meta".to_owned())
                        .build(),
                )
                .build(),
        );
        self.entry.create_indexes(entry_indexes, None).await?;
        Ok(())
    }

    pub async fn suggestions(&self, input: &str) -> Result<SearchResult, SearchError> {
        let query = Query::new(input)?;
        self.run(
            &query,
            Some(Page {
                after: None,
                limit: SUGGESTION_META_LIMIT,
            }),
            Some(Page {
                after: None,
                limit: SUGGESTION_ENTRY_LIMIT,
            }),
            SUGGESTION_PREVIEW_LIMIT,
        )
        .await
    }

    pub async fn search(
        &self,
        input: &str,
        section: Option<SearchSection>,
        cursor: Option<&str>,
    ) -> Result<SearchResult, SearchError> {
        let query = Query::new(input)?;
        let (meta_page, unmatched_page) = match section {
            None if cursor.is_some() => return Err(SearchError::InvalidCursor),
            None => (
                Some(Page {
                    after: None,
                    limit: PAGE_LIMIT,
                }),
                Some(Page {
                    after: None,
                    limit: PAGE_LIMIT,
                }),
            ),
            Some(SearchSection::Metadata) => (
                Some(Page {
                    after: cursor.map(decode_meta_cursor).transpose()?,
                    limit: PAGE_LIMIT,
                }),
                None,
            ),
            Some(SearchSection::Unmatched) => (
                None,
                Some(Page {
                    after: cursor.map(decode_entry_cursor).transpose()?,
                    limit: PAGE_LIMIT,
                }),
            ),
        };
        self.run(&query, meta_page, unmatched_page, PAGE_PREVIEW_LIMIT).await
    }

    pub async fn entries(
        &self,
        meta_id: ObjectId,
        input: &str,
        cursor: Option<&str>,
    ) -> Result<SearchEntryPage, SearchError> {
        let query = Query::new(input)?;
        let cursor = cursor.map(decode_entry_cursor).transpose()?;
        let filter = doc! {
            "$and": [
                { "meta_id": meta_id },
                entry_candidate_filter(&query),
            ],
        };
        let mut entries = find_all(&self.entry, filter)
            .await?
            .into_iter()
            .filter_map(|entry| {
                let matched = match_entry(&query, &entry.inner)?;
                Some(EntryCandidate {
                    entry,
                    matched: Some(matched),
                })
            })
            .collect::<Vec<_>>();
        entries.sort_by(compare_entries);
        Ok(page_entries(entries, cursor.as_ref(), PAGE_LIMIT))
    }

    pub async fn has_meta(&self, id: ObjectId) -> Result<bool, SearchError> {
        Ok(self.meta.find_one(doc! { "_id": id }, None).await?.is_some())
    }

    async fn run(
        &self,
        query: &Query,
        meta_page: Option<Page<MetaCursor>>,
        unmatched_page: Option<Page<EntryCursor>>,
        preview_limit: usize,
    ) -> Result<SearchResult, SearchError> {
        let (metas, aliases, entries) = tokio::try_join!(
            find_all(&self.meta, candidate_filter("_search.titles", query)),
            find_all(&self.alias, candidate_filter("_search.key", query)),
            find_all(&self.entry, entry_candidate_filter(query)),
        )?;

        let direct = metas
            .into_iter()
            .filter_map(|meta| match_meta(query, &meta.inner).map(|matched| (meta, matched)))
            .collect::<Vec<_>>();
        let aliases = aliases
            .into_iter()
            .filter_map(|alias| match_alias(query, &alias.inner.key).map(|matched| (alias.inner.value, matched)))
            .collect::<Vec<_>>();
        let entries = entries
            .into_iter()
            .filter_map(|entry| {
                let matched = match_entry(query, &entry.inner)?;
                Some(EntryCandidate {
                    entry,
                    matched: Some(matched),
                })
            })
            .collect::<Vec<_>>();

        let mut meta_ids = direct.iter().map(|(meta, _)| meta.id).collect::<Vec<_>>();
        meta_ids.extend(aliases.iter().map(|(id, _)| *id));
        meta_ids.extend(entries.iter().filter_map(|entry| entry.entry.inner.meta_id));
        meta_ids.sort_unstable();
        meta_ids.dedup();

        let loaded = self.load_meta(&meta_ids).await?;
        let activity = self.latest_activity(&meta_ids).await?;
        let mut groups = HashMap::<ObjectId, Group>::with_capacity(loaded.len());
        for (id, meta) in loaded {
            let fallback = meta.inner.begin.map(|date| date.timestamp_millis()).unwrap_or_default();
            groups.insert(id, Group {
                meta,
                direct: None,
                entries: Vec::new(),
                latest: activity.get(&id).copied().unwrap_or(fallback),
            });
        }

        for (meta, matched) in direct {
            if let Some(group) = groups.get_mut(&meta.id) {
                group.direct = better(group.direct.take(), matched);
            }
        }
        for (id, matched) in aliases {
            if let Some(group) = groups.get_mut(&id) {
                group.direct = better(group.direct.take(), matched);
            }
        }

        let mut unmatched = Vec::new();
        for entry in entries {
            if let Some(id) = entry.entry.inner.meta_id
                && let Some(group) = groups.get_mut(&id)
            {
                group.entries.push(entry);
            } else {
                unmatched.push(entry);
            }
        }

        let mut groups = groups
            .into_values()
            .filter(|group| group.direct.is_some() || !group.entries.is_empty())
            .collect::<Vec<_>>();
        for group in &mut groups {
            group.entries.sort_by(compare_entries);
        }
        groups.sort_by(compare_groups);
        unmatched.sort_by(compare_entries);

        let metadata = if let Some(Page { after, limit }) = meta_page {
            let mut page = groups
                .into_iter()
                .filter(|group| {
                    after
                        .as_ref()
                        .is_none_or(|cursor| compare_group_cursor(group, cursor) == Ordering::Greater)
                })
                .take(limit + 1)
                .collect::<Vec<_>>();
            let next_cursor = (page.len() > limit).then(|| {
                page.truncate(limit);
                encode_cursor(Cursor::Metadata(meta_cursor(
                    page.last().expect("non-empty metadata page"),
                )))
            });
            Some(SearchMetaPage {
                items: page.into_iter().map(|group| group.into_public(preview_limit)).collect(),
                next_cursor,
            })
        } else {
            None
        };

        let unmatched_entries =
            unmatched_page.map(|Page { after, limit }| page_entries(unmatched, after.as_ref(), limit));
        Ok(SearchResult {
            metadata,
            unmatched_entries,
        })
    }

    async fn load_meta(&self, ids: &[ObjectId]) -> Result<HashMap<ObjectId, WithId<Meta>>, SearchError> {
        if ids.is_empty() {
            return Ok(HashMap::new());
        }
        Ok(find_all(&self.meta, doc! { "_id": { "$in": ids } })
            .await?
            .into_iter()
            .map(|meta| (meta.id, meta))
            .collect())
    }

    async fn latest_activity(&self, ids: &[ObjectId]) -> Result<HashMap<ObjectId, i64>, SearchError> {
        if ids.is_empty() {
            return Ok(HashMap::new());
        }
        let rows = self
            .entry
            .aggregate(
                vec![
                    doc! { "$match": { "meta_id": { "$in": ids } } },
                    doc! { "$group": { "_id": "$meta_id", "latest": { "$max": "$bson_pub_date" } } },
                ],
                None,
            )
            .await?
            .try_collect::<Vec<Document>>()
            .await?;
        Ok(rows
            .into_iter()
            .filter_map(|row| {
                let id = row.get_object_id("_id").ok()?;
                let latest = row.get_datetime("latest").ok()?.timestamp_millis();
                Some((id, latest))
            })
            .collect())
    }
}

#[derive(Debug)]
struct EntryCandidate {
    entry: WithId<PartialEntry>,
    matched: Option<RankedMatch>,
}

#[derive(Debug)]
struct Group {
    meta: WithId<Meta>,
    direct: Option<RankedMatch>,
    entries: Vec<EntryCandidate>,
    latest: i64,
}

impl Group {
    fn rank(&self) -> MatchRank {
        self.direct
            .as_ref()
            .into_iter()
            .chain(self.entries.iter().filter_map(|entry| entry.matched.as_ref()))
            .map(|matched| matched.rank)
            .min()
            .expect("search group must contain a match")
    }

    fn into_public(self, preview_limit: usize) -> SearchMetaGroup {
        let matching_entry_count = self.entries.iter().filter(|entry| entry.matched.is_some()).count() as u64;
        SearchMetaGroup {
            meta: self.meta,
            matched_by: self.direct.map(|matched| matched.matched),
            entries: self
                .entries
                .into_iter()
                .take(preview_limit)
                .map(EntryCandidate::into_public)
                .collect(),
            matching_entry_count,
        }
    }
}

impl EntryCandidate {
    fn into_public(self) -> SearchEntryHit {
        SearchEntryHit {
            entry: self.entry,
            matched_by: self.matched.map(|matched| matched.matched),
        }
    }
}

fn compare_entries(left: &EntryCandidate, right: &EntryCandidate) -> Ordering {
    match (&left.matched, &right.matched) {
        (Some(left), Some(right)) => left.rank.cmp(&right.rank),
        (Some(_), None) => Ordering::Less,
        (None, Some(_)) => Ordering::Greater,
        (None, None) => Ordering::Equal,
    }
    .then_with(|| entry_time(&right.entry).cmp(&entry_time(&left.entry)))
    .then_with(|| left.entry.id.bytes().cmp(&right.entry.id.bytes()))
}

fn compare_entry_cursor(entry: &EntryCandidate, cursor: &EntryCursor) -> Ordering {
    entry
        .matched
        .as_ref()
        .expect("paginated entry must contain a match")
        .rank
        .cmp(&cursor.rank)
        .then_with(|| cursor.time.cmp(&entry_time(&entry.entry)))
        .then_with(|| entry.entry.id.bytes().cmp(&cursor.id.bytes()))
}

fn compare_groups(left: &Group, right: &Group) -> Ordering {
    left.rank()
        .cmp(&right.rank())
        .then_with(|| right.latest.cmp(&left.latest))
        .then_with(|| left.meta.id.bytes().cmp(&right.meta.id.bytes()))
}

fn compare_group_cursor(group: &Group, cursor: &MetaCursor) -> Ordering {
    group
        .rank()
        .cmp(&cursor.rank)
        .then_with(|| cursor.latest.cmp(&group.latest))
        .then_with(|| group.meta.id.bytes().cmp(&cursor.id.bytes()))
}

fn entry_time(entry: &WithId<PartialEntry>) -> i64 {
    entry
        .inner
        .base
        .pub_date
        .map(|date| date.timestamp_millis())
        .unwrap_or_default()
}

fn better(current: Option<RankedMatch>, candidate: RankedMatch) -> Option<RankedMatch> {
    match current {
        Some(current) if current.rank < candidate.rank => Some(current),
        Some(current) if current.rank > candidate.rank => Some(candidate),
        Some(current)
            if current.matched.field == super::model::MatchField::Alias
                && candidate.matched.field == super::model::MatchField::Alias
                && current.matched.text > candidate.matched.text =>
        {
            Some(candidate)
        }
        Some(current) => Some(current),
        None => Some(candidate),
    }
}

fn page_entries(entries: Vec<EntryCandidate>, after: Option<&EntryCursor>, limit: usize) -> SearchEntryPage {
    let mut page = entries
        .into_iter()
        .filter(|entry| after.is_none_or(|cursor| compare_entry_cursor(entry, cursor) == Ordering::Greater))
        .take(limit + 1)
        .collect::<Vec<_>>();
    let next_cursor = (page.len() > limit).then(|| {
        page.truncate(limit);
        encode_cursor(Cursor::Entry(entry_cursor(page.last().expect("non-empty entry page"))))
    });
    SearchEntryPage {
        items: page.into_iter().map(EntryCandidate::into_public).collect(),
        next_cursor,
    }
}

fn meta_cursor(group: &Group) -> MetaCursor {
    MetaCursor {
        rank: group.rank(),
        latest: group.latest,
        id: group.meta.id,
    }
}

fn entry_cursor(entry: &EntryCandidate) -> EntryCursor {
    EntryCursor {
        rank: entry
            .matched
            .as_ref()
            .expect("paginated entry must contain a match")
            .rank,
        time: entry_time(&entry.entry),
        id: entry.entry.id,
    }
}

fn encode_cursor(cursor: Cursor) -> String {
    URL_SAFE_NO_PAD.encode(serde_json::to_vec(&cursor).expect("search cursor must serialize"))
}

fn decode_cursor(cursor: &str) -> Result<Cursor, SearchError> {
    let bytes = URL_SAFE_NO_PAD.decode(cursor).map_err(|_| SearchError::InvalidCursor)?;
    serde_json::from_slice(&bytes).map_err(|_| SearchError::InvalidCursor)
}

fn decode_meta_cursor(cursor: &str) -> Result<MetaCursor, SearchError> {
    match decode_cursor(cursor)? {
        Cursor::Metadata(cursor) => Ok(cursor),
        Cursor::Entry(_) => Err(SearchError::InvalidCursor),
    }
}

fn decode_entry_cursor(cursor: &str) -> Result<EntryCursor, SearchError> {
    match decode_cursor(cursor)? {
        Cursor::Entry(cursor) => Ok(cursor),
        Cursor::Metadata(_) => Err(SearchError::InvalidCursor),
    }
}

async fn find_all<T>(collection: &Collection<WithId<T>>, filter: Document) -> Result<Vec<WithId<T>>, SearchError>
where
    T: DeserializeOwned + Unpin + Send + Sync,
{
    Ok(collection.find(filter, None).await?.try_collect().await?)
}

impl Wrapping<Meta> for BsonMeta {
    type Error = MaterializeError;

    fn try_wrap(meta: Meta) -> Result<Self, MaterializeError> {
        meta.try_into()
    }

    fn unwrap(self) -> Meta {
        self.inner
    }
}

impl Wrapping<PartialEntry> for BsonEntry {
    type Error = MaterializeError;

    fn try_wrap(entry: PartialEntry) -> Result<Self, MaterializeError> {
        entry.try_into()
    }

    fn unwrap(self) -> PartialEntry {
        self.inner
    }
}

fn entry_candidate_filter(query: &Query) -> Document {
    doc! {
        "$or": [
            candidate_filter("_search.title", query),
            candidate_filter("_search.parsed_title", query),
            candidate_filter("_search.torrent_name", query),
        ],
    }
}

fn candidate_filter(prefix: &str, query: &Query) -> Document {
    let grams = query.grams();
    let mut parts = Vec::with_capacity(3);
    push_gram_filter(&mut parts, prefix, "one", &grams.one);
    push_gram_filter(&mut parts, prefix, "two", &grams.two);
    push_gram_filter(&mut parts, prefix, "three", &grams.three);
    match parts.len() {
        0 => doc! { "_id": { "$exists": false } },
        1 => parts.pop().expect("one filter must exist"),
        _ => doc! { "$and": parts },
    }
}

fn push_gram_filter(filters: &mut Vec<Document>, prefix: &str, size: &str, grams: &[String]) {
    if grams.is_empty() {
        return;
    }
    let mut filter = Document::new();
    filter.insert(format!("{prefix}.{size}"), doc! { "$all": grams });
    filters.push(filter);
}

fn gram_indexes(prefix: &str, name: &str) -> Vec<IndexModel> {
    ["one", "two", "three"]
        .into_iter()
        .map(|size| {
            IndexModel::builder()
                .keys(doc! { format!("{prefix}.{size}"): 1 })
                .options(IndexOptions::builder().name(format!("{name}_{size}")).build())
                .build()
        })
        .collect()
}

pub type AliasStorage = Storage<Alias, BsonAlias>;

pub struct AliasIdx;

impl Idx for AliasIdx {
    const SORT_INDEX: Option<&'static str> = None;

    fn indexes() -> impl IntoIterator<Item = IndexModel> {
        [
            IndexModel::builder()
                .keys(doc! { "key": 1 })
                .options(
                    IndexOptions::builder()
                        .unique(true)
                        .name("key_index".to_owned())
                        .build(),
                )
                .build(),
            IndexModel::builder()
                .keys(doc! { "value": 1 })
                .options(IndexOptions::builder().name("value_index".to_owned()).build())
                .build(),
        ]
    }
}

impl Resource for BsonAlias {
    type Idx = AliasIdx;
}

impl Wrapping<Alias> for BsonAlias {
    type Error = MaterializeError;

    fn try_wrap(alias: Alias) -> Result<Self, MaterializeError> {
        alias.try_into()
    }

    fn unwrap(self) -> Alias {
        self.inner
    }
}

impl Storage<Alias, BsonAlias> {
    pub async fn upsert(&self, key: &str, value: &ObjectId) -> CrudResult<Option<ObjectId>> {
        let alias = BsonAlias::try_from(Alias {
            key: key.to_owned(),
            value: *value,
        })
        .map_err(|error| CrudError::InvalidResource(error.to_string()))?;
        let update = bson::to_document(&alias)?;
        self.set
            .update_one(
                doc! { "key": key },
                UpdateModifications::Document(doc! { "$set": update }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await
            .map(|result| result.upserted_id.as_ref().and_then(Bson::as_object_id))
            .map_err(CrudError::from)
    }

    pub async fn get(&self, key: &str) -> Result<Option<ObjectId>, mongodb::error::Error> {
        Ok(self
            .get
            .find_one(doc! { "key": key }, None)
            .await?
            .map(|alias| alias.inner.value))
    }

    pub async fn list_keys_by_value(
        &self,
        value: &ObjectId,
        param: ListParam,
    ) -> CrudResult<ListResult<WithId<Alias>>> {
        self.list_by(doc! { "value": value }, param).await
    }

    pub async fn delete(&self, key: &str) -> Result<bool, mongodb::error::Error> {
        self.set
            .delete_one(doc! { "key": key }, None)
            .await
            .map(|result| result.deleted_count != 0)
    }
}

#[cfg(test)]
mod tests {
    use mongodb::bson::oid::ObjectId;

    use super::{Cursor, MetaCursor, better, decode_entry_cursor, decode_meta_cursor, encode_cursor};
    use crate::search::text::{Query, match_alias};

    #[test]
    fn picks_a_stable_alias_when_ranks_are_equal() {
        let query = Query::new("frieren").unwrap();
        let lower = match_alias(&query, "frieren").unwrap();
        let capitalized = match_alias(&query, "Frieren").unwrap();
        let selected = better(Some(lower), capitalized).unwrap();
        assert_eq!(selected.matched.text, "Frieren");
    }

    #[test]
    fn round_trips_typed_opaque_cursors() {
        let rank = match_alias(&Query::new("frieren").unwrap(), "Frieren").unwrap().rank;
        let cursor = MetaCursor {
            rank,
            latest: 42,
            id: ObjectId::new(),
        };
        let encoded = encode_cursor(Cursor::Metadata(MetaCursor {
            rank: cursor.rank,
            latest: cursor.latest,
            id: cursor.id,
        }));
        assert_eq!(decode_meta_cursor(&encoded).unwrap(), cursor);
        assert!(decode_entry_cursor(&encoded).is_err());
        assert!(decode_meta_cursor("20").is_err());
    }
}

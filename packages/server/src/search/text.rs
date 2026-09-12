use std::cmp::Ordering;

use forrit_core::model::{Alias, Meta, PartialEntry};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use unicode_normalization::UnicodeNormalization;

use super::model::{
    AliasMaterial, BsonAlias, BsonEntry, BsonMeta, EntryMaterial, Grams, MatchField, MatchKind, MetaMaterial,
    SearchMatch,
};

pub(crate) const MAX_FIELD_CHARS: usize = 1_024;
pub(crate) const MAX_QUERY_CHARS: usize = 200;

#[derive(Clone, Debug, Error, PartialEq, Eq)]
pub enum MaterializeError {
    #[error("{field} contains {chars} normalized characters; maximum is {MAX_FIELD_CHARS}")]
    FieldTooLong { field: &'static str, chars: usize },
}

#[derive(Clone, Debug, Error, PartialEq, Eq)]
pub enum QueryError {
    #[error("query must contain one non-ASCII character or two adjacent ASCII characters")]
    TooShort,

    #[error("query contains {chars} normalized characters; maximum is {MAX_QUERY_CHARS}")]
    TooLong { chars: usize },
}

#[derive(Clone, Debug)]
pub(crate) struct Query {
    pub normalized: String,
    pub terms: Vec<String>,
}

impl Query {
    pub(crate) fn new(input: &str) -> Result<Self, QueryError> {
        let normalized = normalize(input);
        let chars = normalized.chars().count();
        if chars > MAX_QUERY_CHARS {
            return Err(QueryError::TooLong { chars });
        }

        let terms = normalized.split_whitespace().map(str::to_owned).collect::<Vec<_>>();
        if !terms.iter().any(|term| eligible(term)) {
            return Err(QueryError::TooShort);
        }

        Ok(Self { normalized, terms })
    }

    pub(crate) fn grams(&self) -> Grams {
        let mut grams = Grams::default();
        for term in &self.terms {
            if eligible(term) {
                grams.merge(grams_for_normalized(term));
            }
        }
        grams
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub(crate) struct RankedMatch {
    pub matched: SearchMatch,
    pub rank: MatchRank,
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub(crate) struct MatchRank {
    kind: u8,
    field: u8,
    position: usize,
    length: usize,
}

impl Ord for MatchRank {
    fn cmp(&self, other: &Self) -> Ordering {
        (self.kind, self.field, self.position, self.length).cmp(&(
            other.kind,
            other.field,
            other.position,
            other.length,
        ))
    }
}

impl PartialOrd for MatchRank {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub(crate) fn normalize(input: &str) -> String {
    let mut output = String::with_capacity(input.len());
    let mut separated = true;

    for ch in input.nfkc().flat_map(char::to_lowercase) {
        if is_separator(ch) {
            if !separated {
                output.push(' ');
                separated = true;
            }
        } else {
            output.push(ch);
            separated = false;
        }
    }

    if output.ends_with(' ') {
        output.pop();
    }
    output
}

fn is_separator(ch: char) -> bool {
    ch.is_whitespace() || matches!(ch, '-' | '_' | '/' | '\\' | '／' | '・' | '·')
}

fn eligible(term: &str) -> bool {
    let mut chars = term.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    !first.is_ascii() || chars.next().is_some()
}

fn material(field: &'static str, input: &str) -> Result<Grams, MaterializeError> {
    let normalized = normalize(input);
    let chars = normalized.chars().count();
    if chars > MAX_FIELD_CHARS {
        return Err(MaterializeError::FieldTooLong { field, chars });
    }
    Ok(grams_for_normalized(&normalized))
}

fn grams_for_normalized(input: &str) -> Grams {
    let chars = input.chars().collect::<Vec<_>>();
    let mut grams = Grams {
        one: chars
            .iter()
            .filter(|ch| !ch.is_ascii() && !ch.is_whitespace())
            .map(char::to_string)
            .collect(),
        two: chars.windows(2).map(|window| window.iter().collect()).collect(),
        three: chars.windows(3).map(|window| window.iter().collect()).collect(),
    };
    grams.merge(Grams::default());
    grams
}

fn merge_fields<'a>(field: &'static str, values: impl IntoIterator<Item = &'a str>) -> Result<Grams, MaterializeError> {
    let mut merged = Grams::default();
    for value in values {
        merged.merge(material(field, value)?);
    }
    Ok(merged)
}

impl TryFrom<Meta> for BsonMeta {
    type Error = MaterializeError;

    fn try_from(meta: Meta) -> Result<Self, Self::Error> {
        let search = MetaMaterial {
            titles: merge_fields("metadata title", meta_texts(&meta).map(|(_, text)| text))?,
        };
        Ok(Self {
            bson_begin: meta.begin.map(mongodb::bson::DateTime::from_chrono),
            bson_end: meta.end.map(mongodb::bson::DateTime::from_chrono),
            tv_id: meta.tv.as_ref().map(|tv| tv.inner.id),
            search,
            inner: meta,
        })
    }
}

impl TryFrom<PartialEntry> for BsonEntry {
    type Error = MaterializeError;

    fn try_from(entry: PartialEntry) -> Result<Self, Self::Error> {
        let search = EntryMaterial {
            title: material("entry title", &entry.base.title)?,
            parsed_title: material(
                "parsed entry title",
                entry
                    .base
                    .elements
                    .get("AnimeTitle")
                    .map(String::as_str)
                    .unwrap_or_default(),
            )?,
            torrent_name: material("torrent name", &entry.base.torrent_name)?,
        };
        Ok(Self {
            bson_pub_date: entry.base.pub_date.map(mongodb::bson::DateTime::from_chrono),
            search,
            inner: entry,
        })
    }
}

impl TryFrom<Alias> for BsonAlias {
    type Error = MaterializeError;

    fn try_from(alias: Alias) -> Result<Self, Self::Error> {
        Ok(Self {
            search: AliasMaterial {
                key: material("alias", &alias.key)?,
            },
            inner: alias,
        })
    }
}

pub(crate) fn match_meta(query: &Query, meta: &Meta) -> Option<RankedMatch> {
    meta_texts(meta)
        .filter_map(|(field, text)| match_text(query, field, text))
        .min_by_key(|matched| matched.rank)
}

pub(crate) fn match_alias(query: &Query, alias: &str) -> Option<RankedMatch> {
    match_text(query, MatchField::Alias, alias)
}

pub(crate) fn match_entry(query: &Query, entry: &PartialEntry) -> Option<RankedMatch> {
    [
        (MatchField::EntryTitle, entry.base.title.as_str()),
        (
            MatchField::ParsedTitle,
            entry
                .base
                .elements
                .get("AnimeTitle")
                .map(String::as_str)
                .unwrap_or_default(),
        ),
        (MatchField::TorrentName, entry.base.torrent_name.as_str()),
    ]
    .into_iter()
    .filter_map(|(field, text)| match_text(query, field, text))
    .min_by_key(|matched| matched.rank)
}

fn meta_texts(meta: &Meta) -> impl Iterator<Item = (MatchField, &str)> {
    std::iter::once((MatchField::MetaTitle, meta.title.as_str()))
        .chain(
            meta.title_translate
                .values()
                .flatten()
                .map(|title| (MatchField::MetaTitle, title.as_str())),
        )
        .chain(meta.tv.iter().flat_map(|tv| {
            [
                (MatchField::TmdbName, tv.inner.name.as_str()),
                (MatchField::TmdbName, tv.inner.original_name.as_str()),
            ]
        }))
}

fn match_text(query: &Query, field: MatchField, source: &str) -> Option<RankedMatch> {
    if source.is_empty() {
        return None;
    }
    let normalized = normalize(source);
    let (kind, position, fragments) = if normalized == query.normalized {
        (MatchKind::Exact, 0, vec![query.normalized.clone()])
    } else if normalized.starts_with(&query.normalized) {
        (MatchKind::Prefix, 0, vec![query.normalized.clone()])
    } else if let Some(position) = normalized.find(&query.normalized) {
        (MatchKind::Substring, normalized[..position].chars().count(), vec![
            query.normalized.clone(),
        ])
    } else {
        let positions = query
            .terms
            .iter()
            .map(|term| normalized.find(term))
            .collect::<Option<Vec<_>>>()?;
        let position = positions
            .into_iter()
            .map(|position| normalized[..position].chars().count())
            .min()
            .unwrap_or(0);
        (MatchKind::Terms, position, query.terms.clone())
    };

    Some(RankedMatch {
        matched: SearchMatch {
            kind,
            field,
            text: source.to_owned(),
            fragments,
        },
        rank: MatchRank {
            kind: kind_rank(kind),
            field: field_rank(field),
            position,
            length: normalized.chars().count(),
        },
    })
}

fn kind_rank(kind: MatchKind) -> u8 {
    match kind {
        MatchKind::Exact => 0,
        MatchKind::Prefix => 1,
        MatchKind::Substring => 2,
        MatchKind::Terms => 3,
    }
}

fn field_rank(field: MatchField) -> u8 {
    match field {
        MatchField::MetaTitle | MatchField::TmdbName => 0,
        MatchField::Alias => 1,
        MatchField::EntryTitle => 2,
        MatchField::ParsedTitle => 3,
        MatchField::TorrentName => 4,
    }
}

#[cfg(test)]
mod tests {
    use super::{
        MatchField, MatchKind, MaterializeError, Query, QueryError, grams_for_normalized, match_text, material,
        normalize,
    };

    #[test]
    fn normalizes_width_case_whitespace_and_separators() {
        assert_eq!(
            normalize("  ＦＲＩＥＲＥＮ／Beyond_the-End  "),
            "frieren beyond the end"
        );
    }

    #[test]
    fn builds_adaptive_character_grams() {
        let grams = grams_for_normalized("葬送ab");
        assert_eq!(grams.one, ["葬", "送"]);
        assert!(grams.two.contains(&"葬送".to_owned()));
        assert!(grams.three.contains(&"送ab".to_owned()));
    }

    #[test]
    fn builds_query_grams_without_crossing_term_boundaries() {
        let grams = Query::new("beyond frieren").unwrap().grams();
        assert!(grams.two.contains(&"be".to_owned()));
        assert!(grams.two.contains(&"fr".to_owned()));
        assert!(!grams.two.iter().any(|gram| gram.contains(' ')));
    }

    #[test]
    fn ranks_phrase_before_unordered_terms() {
        let query = Query::new("frieren beyond").unwrap();
        let phrase = match_text(&query, MatchField::MetaTitle, "Frieren Beyond Journey's End").unwrap();
        let terms = match_text(&query, MatchField::MetaTitle, "Beyond Frieren Journey's End").unwrap();
        assert_eq!(phrase.matched.kind, MatchKind::Prefix);
        assert_eq!(terms.matched.kind, MatchKind::Terms);
        assert!(phrase.rank < terms.rank);
    }

    #[test]
    fn rejects_short_and_long_queries() {
        assert_eq!(Query::new("a").unwrap_err(), QueryError::TooShort);
        assert_eq!(Query::new("a b").unwrap_err(), QueryError::TooShort);
        assert_eq!(Query::new(&"a".repeat(201)).unwrap_err(), QueryError::TooLong {
            chars: 201
        },);
    }

    #[test]
    fn rejects_oversized_search_fields() {
        assert_eq!(
            material("entry title", &"葬".repeat(1_025)).unwrap_err(),
            MaterializeError::FieldTooLong {
                field: "entry title",
                chars: 1_025,
            },
        );
    }

    #[test]
    fn uses_field_priority_after_match_quality() {
        let query = Query::new("frieren").unwrap();
        let metadata = match_text(&query, MatchField::MetaTitle, "Frieren").unwrap();
        let alias = match_text(&query, MatchField::Alias, "Frieren").unwrap();
        let entry = match_text(&query, MatchField::EntryTitle, "Frieren").unwrap();
        assert!(metadata.rank < alias.rank);
        assert!(alias.rank < entry.rank);
    }

    #[test]
    fn reports_every_term_for_highlighting() {
        let query = Query::new("beyond frieren").unwrap();
        let matched = match_text(&query, MatchField::MetaTitle, "Frieren: Beyond Journey's End").unwrap();
        assert_eq!(matched.matched.kind, MatchKind::Terms);
        assert_eq!(matched.matched.fragments, ["beyond", "frieren"]);
    }
}

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use forrit_core::model::{DirectedCursor, Direction, ListParam, ListResult, PageInfo};
use futures::TryStreamExt;
use mongodb::{
    Collection,
    bson::{self, Bson, DateTime, Document, doc, oid::ObjectId},
};
use serde::de::DeserializeOwned;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PaginationError {
    #[error("Invalid pagination cursor")]
    InvalidCursor,

    #[error("Could not encode pagination cursor or decode page item: {0}")]
    Bson(#[from] bson::error::Error),

    #[error("Pagination query failed: {0}")]
    Mongo(#[from] mongodb::error::Error),
}

pub(super) async fn find_paginated<T>(
    collection: &Collection<T>,
    filter: Document,
    date_field: Option<&str>,
    param: ListParam,
) -> Result<ListResult<T>, PaginationError>
where
    T: DeserializeOwned + Send + Sync,
{
    let mut backwards = false;
    let query = if let Some(cursor) = param.cursor {
        let cursor = decode_cursor(&cursor, date_field)?;
        backwards = matches!(param.direction, Direction::Backwards);
        cursor.filter(filter.clone(), date_field, backwards)
    } else {
        filter.clone()
    };

    let order = if backwards { 1 } else { -1 };
    let mut sort = Document::new();
    if let Some(field) = date_field {
        sort.insert(field, order);
    }
    sort.insert("_id", order);

    let documents = collection.clone_with_type::<Document>();
    let mut rows: Vec<Document> = documents
        .find(query)
        .sort(sort)
        .limit(i64::from(param.per_page))
        .await?
        .try_collect()
        .await?;
    if backwards {
        rows.reverse();
    }

    let page_info = if let (Some(first), Some(last)) = (rows.first(), rows.last()) {
        let first = Cursor::from_document(first, date_field)?;
        let last = Cursor::from_document(last, date_field)?;
        let (has_previous_page, has_next_page) = futures::try_join!(
            has_page(&documents, first.filter(filter.clone(), date_field, true)),
            has_page(&documents, last.filter(filter.clone(), date_field, false)),
        )?;
        PageInfo {
            has_previous_page,
            has_next_page,
            start_cursor: Some(DirectedCursor::Backwards(first.encode(date_field)?)),
            end_cursor: Some(DirectedCursor::Forward(last.encode(date_field)?)),
        }
    } else {
        PageInfo::default()
    };

    Ok(ListResult {
        total_count: collection.count_documents(filter).await?,
        page_info,
        items: rows
            .into_iter()
            .map(bson::deserialize_from_document)
            .collect::<Result<_, _>>()?,
    })
}

async fn has_page(collection: &Collection<Document>, query: Document) -> mongodb::error::Result<bool> {
    Ok(collection
        .find_one(query)
        .projection(doc! { "_id": 1 })
        .await?
        .is_some())
}

struct Cursor {
    id: ObjectId,
    date: Option<DateTime>,
}

impl Cursor {
    fn from_document(document: &Document, date_field: Option<&str>) -> Result<Self, PaginationError> {
        let id = document
            .get_object_id("_id")
            .map_err(|_| PaginationError::InvalidCursor)?;
        let date = match date_field.and_then(|field| document.get(field)) {
            Some(Bson::DateTime(date)) => Some(*date),
            Some(Bson::Null) | None => None,
            _ => return Err(PaginationError::InvalidCursor),
        };
        Ok(Self { id, date })
    }

    fn filter(&self, base: Document, date_field: Option<&str>, backwards: bool) -> Document {
        let op = if backwards { "$gt" } else { "$lt" };
        let mut tie = doc! { "_id": { op: self.id } };
        let boundary = if let Some(field) = date_field {
            tie.insert(field, self.date.map_or(Bson::Null, Bson::DateTime));
            // MongoDB sorts null and missing dates before BSON dates, but
            // comparison operators only compare values of the same BSON type.
            match (self.date, backwards) {
                (Some(date), false) => doc! { "$or": [{ field: { op: date } }, { field: null }, tie] },
                (Some(date), true) => doc! { "$or": [{ field: { op: date } }, tie] },
                (None, true) => doc! { "$or": [{ field: { "$type": "date" } }, tie] },
                (None, false) => tie,
            }
        } else {
            tie
        };
        if base.is_empty() {
            boundary
        } else {
            doc! { "$and": [base, boundary] }
        }
    }

    fn encode(&self, date_field: Option<&str>) -> bson::error::Result<String> {
        let mut document = Document::new();
        if let Some(field) = date_field {
            document.insert(field, self.date.map_or(Bson::Null, Bson::DateTime));
        }
        document.insert("_id", self.id);
        Ok(URL_SAFE_NO_PAD.encode(bson::serialize_to_vec(&document)?))
    }
}

fn decode_cursor(cursor: &str, date_field: Option<&str>) -> Result<Cursor, PaginationError> {
    let bytes = URL_SAFE_NO_PAD
        .decode(cursor)
        .map_err(|_| PaginationError::InvalidCursor)?;
    let document = bson::deserialize_from_slice(&bytes).map_err(|_| PaginationError::InvalidCursor)?;
    Cursor::from_document(&document, date_field)
}

#[cfg(test)]
mod tests {
    use forrit_core::model::{DirectedCursor, Direction, ListParam};
    use mongodb::{
        Client,
        bson::{DateTime, Document, doc, oid::ObjectId},
    };

    use super::{decode_cursor, find_paginated};

    #[test]
    fn accepts_existing_cursor_encoding() {
        let id = ObjectId::parse_str("67f000000000000000000001").unwrap();
        let cursor = "FgAAAAdfaWQAZ_AAAAAAAAAAAAABAA";
        let parsed = decode_cursor(cursor, None).unwrap();
        assert_eq!(parsed.id, id);
        assert_eq!(parsed.encode(None).unwrap(), cursor);
        assert!(decode_cursor(&cursor[..cursor.len() - 2], None).is_err());
    }

    #[tokio::test]
    #[ignore = "requires an isolated MongoDB instance via FORRIT_TEST_MONGODB_URL"]
    async fn pages_in_both_directions_across_tied_and_missing_dates() {
        let url = std::env::var("FORRIT_TEST_MONGODB_URL").unwrap();
        let client = Client::with_uri_str(url).await.unwrap();
        let collection = client
            .database("forrit_test")
            .collection::<Document>(&ObjectId::new().to_hex());
        let ids = [0, 1, 2, 3, 4].map(|i| ObjectId::from_bytes([i; 12]));
        let date = DateTime::from_millis(1000);
        collection
            .insert_many([
                doc! { "_id": ids[0], "group": "keep" },
                doc! { "_id": ids[1], "group": "keep", "date": null },
                doc! { "_id": ids[2], "group": "keep", "date": date },
                doc! { "_id": ids[3], "group": "skip", "date": date },
                doc! { "_id": ids[4], "group": "keep", "date": date },
            ])
            .await
            .unwrap();
        let page = |direction, cursor| {
            find_paginated(&collection, doc! { "group": "keep" }, Some("date"), ListParam {
                per_page: 2,
                direction,
                cursor,
            })
        };

        let first = page(Direction::Forward, None).await.unwrap();
        assert_eq!(first.total_count, 4);
        assert_eq!(
            first
                .items
                .iter()
                .map(|row| row.get_object_id("_id").unwrap())
                .collect::<Vec<_>>(),
            [ids[4], ids[2]]
        );
        assert!(first.page_info.has_next_page && !first.page_info.has_previous_page);
        let Some(DirectedCursor::Forward(end)) = first.page_info.end_cursor else {
            panic!("missing forward cursor")
        };

        let next = page(Direction::Forward, Some(end)).await.unwrap();
        assert_eq!(next.total_count, 4);
        assert_eq!(
            next.items
                .iter()
                .map(|row| row.get_object_id("_id").unwrap())
                .collect::<Vec<_>>(),
            [ids[1], ids[0]]
        );
        assert!(next.page_info.has_previous_page && !next.page_info.has_next_page);
        let Some(DirectedCursor::Backwards(start)) = next.page_info.start_cursor else {
            panic!("missing backward cursor")
        };

        let previous = page(Direction::Backwards, Some(start)).await.unwrap();
        assert_eq!(previous.items, first.items);
        collection.drop().await.unwrap();
    }
}

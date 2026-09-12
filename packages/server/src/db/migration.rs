use std::{borrow::Cow, fmt::Display};

use forrit_core::model::{Alias, Meta, PartialEntry, WithId};
use futures::TryStreamExt;
use mongodb::{
    Collection,
    bson::{self, Bson, Document, doc},
    options::{UpdateModifications, UpdateOptions},
};
use serde::{Serialize, de::DeserializeOwned};

use crate::{
    db::{Collections, InitError, InitResult},
    search::{BsonAlias, BsonEntry, BsonMeta},
    sourcer::sanitize_description,
    util::get_torrent_info,
};

pub(crate) trait Migration {
    fn version(&self) -> Cow<'static, str>;

    fn description(&self) -> Cow<'static, str>;

    async fn run(&self, col: &Collections) -> InitResult<()>;
}

pub struct AddTorrentInfoToEntry;

impl Migration for AddTorrentInfoToEntry {
    fn version(&self) -> Cow<'static, str> {
        "2025-09-27-01".into()
    }

    fn description(&self) -> Cow<'static, str> {
        "Add torrent information to entry documents".into()
    }

    async fn run(&self, col: &Collections) -> InitResult<()> {
        let entry = col.entry.set.clone_with_type::<Document>();

        entry
            .find(doc! { "info_hash": { "$exists": false }}, None)
            .await?
            .try_for_each_concurrent(50, |doc| {
                let entry = entry.clone();
                async move {
                    let id = doc.get_object_id("_id").expect("_id missing");
                    let torrent = doc.get_str("torrent").expect("torrent field missing");
                    let Ok(info) = get_torrent_info(torrent).await else {
                        tracing::debug!("Failed to get torrent info for torrent {torrent}, deleting entry");
                        entry.delete_one(doc! { "_id": id }, None).await?;
                        return Ok(());
                    };

                    entry
                        .update_one(
                            doc! { "_id": id },
                            UpdateModifications::Document(doc! {
                                "$set": {
                                    "info_hash": info.info_hash,
                                    "name": info.name,
                                    "size": info.size as i64,
                                }
                            }),
                            UpdateOptions::builder().upsert(false).build(),
                        )
                        .await
                        .expect("Failed to update entry");

                    Ok(())
                }
            })
            .await?;
        Ok(())
    }
}

pub struct SanitizeEntryDescriptions;

impl Migration for SanitizeEntryDescriptions {
    fn version(&self) -> Cow<'static, str> {
        "2026-07-21-01".into()
    }

    fn description(&self) -> Cow<'static, str> {
        "Sanitize HTML in entry descriptions".into()
    }

    async fn run(&self, col: &Collections) -> InitResult<()> {
        let entry = col.entry.set.clone_with_type::<Document>();

        entry
            .find(doc! { "description": { "$type": "string" } }, None)
            .await?
            .try_for_each_concurrent(50, |doc| {
                let entry = entry.clone();
                async move {
                    let id = doc.get_object_id("_id").expect("_id missing");
                    let description = doc.get_str("description").expect("description must be a string");
                    let sanitized = sanitize_description(description);
                    if sanitized != description {
                        entry
                            .update_one(doc! { "_id": id }, doc! { "$set": { "description": sanitized } }, None)
                            .await?;
                    }
                    Ok(())
                }
            })
            .await?;
        Ok(())
    }
}

pub struct SearchMaterial;

impl Migration for SearchMaterial {
    fn version(&self) -> Cow<'static, str> {
        "2026-09-10-01".into()
    }

    fn description(&self) -> Cow<'static, str> {
        "Materialize indexed search fields".into()
    }

    async fn run(&self, col: &Collections) -> InitResult<()> {
        materialize::<Meta, BsonMeta>(col.meta.set.clone_with_type(), "meta").await?;
        materialize::<PartialEntry, BsonEntry>(col.entry.set.clone_with_type(), "entry").await?;
        materialize::<Alias, BsonAlias>(col.alias.set.clone_with_type(), "alias").await
    }
}

fn search_material(value: &impl Serialize) -> InitResult<Bson> {
    Ok(mongodb::bson::to_document(value)?
        .remove("_search")
        .expect("search wrapper must serialize _search"))
}

async fn materialize<R, W>(collection: Collection<Document>, name: &'static str) -> InitResult<()>
where
    WithId<R>: DeserializeOwned,
    W: Serialize + TryFrom<R>,
    W::Error: Display,
{
    collection
        .find(doc! { "_search": { "$exists": false } }, None)
        .await?
        .map_err(InitError::from)
        .try_for_each_concurrent(50, |document| {
            let collection = collection.clone();
            async move {
                let raw_id = document.get("_id").cloned().unwrap_or(Bson::Null);
                let WithId { id, inner } = bson::from_document(document).map_err(|source| InitError::SearchDecode {
                    collection: name,
                    id: raw_id,
                    source,
                })?;
                let wrapped = W::try_from(inner).map_err(|source| InitError::SearchMaterial {
                    collection: name,
                    id,
                    reason: source.to_string(),
                })?;
                collection
                    .update_one(
                        doc! { "_id": id },
                        doc! { "$set": { "_search": search_material(&wrapped)? } },
                        None,
                    )
                    .await?;
                Ok(())
            }
        })
        .await
}

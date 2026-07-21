use std::borrow::Cow;

use futures::TryStreamExt;
use mongodb::{
    bson::{Document, doc},
    options::{UpdateModifications, UpdateOptions},
};

use crate::{
    db::{Collections, MongoResult},
    sourcer::sanitize_description,
    util::get_torrent_info,
};

pub(crate) trait Migration {
    fn version(&self) -> Cow<'static, str>;

    fn description(&self) -> Cow<'static, str>;

    async fn run(&self, col: &Collections) -> MongoResult<()>;
}

pub struct AddTorrentInfoToEntry;

impl Migration for AddTorrentInfoToEntry {
    fn version(&self) -> Cow<'static, str> {
        "2025-09-27-01".into()
    }

    fn description(&self) -> Cow<'static, str> {
        "Add torrent information to entry documents".into()
    }

    async fn run(&self, col: &Collections) -> MongoResult<()> {
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

    async fn run(&self, col: &Collections) -> MongoResult<()> {
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
            .await
    }
}

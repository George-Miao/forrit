use std::borrow::Cow;

use futures::{TryStreamExt, future::BoxFuture};
use mongodb::{
    bson::{Document, doc},
    options::{UpdateModifications, UpdateOptions},
};

use crate::{
    db::{Collections, MongoResult},
    util::get_torrent_info,
};

pub trait Migration {
    fn version(&self) -> Cow<'static, str>;

    fn description(&self) -> Cow<'static, str>;

    fn run(&self, col: &Collections) -> BoxFuture<'_, MongoResult<()>>;
}

pub struct AddTorrentInfoToEntry;

impl Migration for AddTorrentInfoToEntry {
    fn version(&self) -> Cow<'static, str> {
        "2025-09-27-01".into()
    }

    fn description(&self) -> Cow<'static, str> {
        "Add torrent information to entry documents".into()
    }

    fn run(&self, col: &Collections) -> BoxFuture<'_, MongoResult<()>> {
        let entry = col.entry.set.clone_with_type::<Document>();
        Box::pin(async move {
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
        })
    }
}

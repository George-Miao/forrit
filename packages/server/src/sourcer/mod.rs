//! Source module
//!
//! Used to fetch updates of subtitle groups from source websites/feeds.

use forrit_config::{get_config, SourcerType};
use forrit_core::model::{BsonEntry, ListParam, ListResult, PartialEntry, WithId};
use mongodb::{
    bson::{doc, oid::ObjectId, Bson},
    options::{UpdateModifications, UpdateOptions},
};
use ractor::Actor;
use tap::Pipe;
use tracing::warn;

use crate::{
    db::{impl_resource, Collections, CrudResult, MongoResult, Storage, Wrapping},
    util::Boom,
    REQ,
};

mod rss;

pub type EntryStorage = Storage<PartialEntry, BsonEntry>;

pub async fn start(db: &Collections) {
    let config = &get_config().sourcer;

    if config.is_empty() {
        warn!("No sourcer enabled, nothing will be fetched nor downloaded.");
    }

    for (id, conf) in config.iter("rss-") {
        if !conf.enable {
            continue;
        }

        match &conf.ty {
            SourcerType::Rss(rss_conf) => {
                let actor = rss::RssActor::new(rss_conf, REQ.clone(), db.entry.clone(), id.clone());
                Actor::spawn(format!("sourcer-{id}").pipe(Some), actor, ())
                    .await
                    .boom("Failed to spawn rss actor");
            }
        }
    }
}

#[derive(Debug)]
pub enum SourcerMessage {
    Update,
}

impl Wrapping<PartialEntry> for BsonEntry {
    fn wrap(x: PartialEntry) -> Self {
        x.into()
    }

    fn unwrap(self) -> PartialEntry {
        self.into()
    }
}

impl_resource!(BsonEntry, sort_by bson_pub_date, field(guid, meta_id, download_id));

impl EntryStorage {
    pub async fn list_by_meta_id(
        &self,
        meta_id: ObjectId,
        param: ListParam,
    ) -> CrudResult<ListResult<WithId<PartialEntry>>> {
        self.list_by(doc! { BsonEntryIdx::META_ID: meta_id }, param)
            .await?
            .pipe(Ok)
    }

    pub async fn list_groups_of_meta(&self, meta_id: ObjectId) -> MongoResult<Vec<String>> {
        self.get
            .distinct("group", doc! { "meta_id": meta_id }, None)
            .await?
            .into_iter()
            .map(|x| {
                if let Bson::String(s) = x {
                    s
                } else {
                    panic!("Invalid group value")
                }
            })
            .collect::<Vec<_>>()
            .pipe(Ok)
    }

    pub async fn get_by_guid(&self, guid: &str) -> MongoResult<Option<WithId<PartialEntry>>> {
        self.get.find_one(doc! { BsonEntryIdx::GUID: guid }, None).await
    }

    pub async fn exist(&self, guid: &str, only_resolved: bool) -> MongoResult<bool> {
        let mut query = doc! { BsonEntryIdx::GUID: guid };
        if only_resolved {
            query.insert(BsonEntryIdx::META_ID, doc! { "$ne": null });
        };
        self.get.find_one(query, None).await?.is_some().pipe(Ok)
    }

    pub async fn set_download_id(&self, id: ObjectId, download_id: ObjectId) -> MongoResult<()> {
        self.set
            .update_one(
                doc! { "_id": id },
                doc! { "$set": doc! { BsonEntryIdx::DOWNLOAD_ID: download_id } },
                None,
            )
            .await
            .map(|_| ())
    }

    pub async fn upsert(&self, entry: &PartialEntry) -> MongoResult<Option<ObjectId>> {
        let doc = mongodb::bson::to_document(entry).expect("Failed to convert Meta to bson Document");

        self.set
            .update_one(
                doc! { BsonEntryIdx::GUID: &entry.guid },
                UpdateModifications::Document(doc! { "$set": doc }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await?
            .upserted_id
            .and_then(|x| x.as_object_id())
            .pipe(Ok)
    }
}

#[test]
fn migrate() {
    use futures::TryStreamExt;

    crate::test::run(|env| async move {
        let db = env.col.entry.clone();
        db.get
            .find(None, None)
            .await
            .unwrap()
            .try_for_each_concurrent(None, |WithId { id, inner }| {
                let db = db.clone();
                async move {
                    let new = BsonEntry::wrap(inner);
                    let bson = mongodb::bson::to_bson(&new).unwrap();
                    db.set
                        .update_one(doc! { "_id": &id }, doc! { "$set": bson }, None)
                        .await
                        .unwrap();
                    Ok(())
                }
            })
            .await
            .unwrap();
    })
}

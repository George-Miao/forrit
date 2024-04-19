//! Source module
//!
//! Used to fetch updates of subtitle groups from source websites/feeds.

use forrit_config::{get_config, SourcerType};
use forrit_core::model::{PartialEntry, WithId};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::{IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use ractor::Actor;
use tap::Pipe;
use tracing::warn;

use crate::{
    db::{impl_delegate_crud, Collections, CrudHandler, GetSet, MongoResult},
    util::Boom,
    REQ,
};

mod rss;

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

#[derive(Debug, Clone)]
pub struct EntryStorage(GetSet<PartialEntry>);

impl CrudHandler for EntryStorage {
    type Resource = PartialEntry;
    type Shim = PartialEntry;

    impl_delegate_crud!();
}

impl EntryStorage {
    const GUID_INDEX: &'static str = "guid";

    pub async fn new(col: Collection<PartialEntry>) -> MongoResult<Self> {
        let this = Self(GetSet::new(col));
        this.create_indexes().await?;
        Ok(this)
    }

    pub async fn create_indexes(&self) -> Result<(), mongodb::error::Error> {
        self.0
            .set
            .create_index(
                IndexModel::builder()
                    .keys(doc! { Self::GUID_INDEX: 1 })
                    .options(IndexOptions::builder().name("guid_index".to_owned()).build())
                    .build(),
                None,
            )
            .await?;
        Ok(())
    }

    pub async fn get_by_guid(&self, guid: &str) -> MongoResult<Option<WithId<PartialEntry>>> {
        self.0.get.find_one(doc! { "guid": guid }, None).await
    }

    pub async fn exist(&self, guid: &str, only_resolved: bool) -> MongoResult<bool> {
        let mut query = doc! { "guid": guid };
        if only_resolved {
            query.insert("meta_id", doc! { "$ne": null });
        };
        self.0.get.find_one(query, None).await?.is_some().pipe(Ok)
    }

    pub async fn upsert(&self, entry: &PartialEntry) -> MongoResult<Option<ObjectId>> {
        let doc = mongodb::bson::to_document(entry).expect("Failed to convert Meta to bson Document");

        self.0
            .set
            .update_one(
                doc! { "guid": &entry.guid },
                UpdateModifications::Document(doc! { "$set": doc }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await?
            .upserted_id
            .and_then(|x| x.as_object_id())
            .pipe(Ok)
    }
}

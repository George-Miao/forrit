//! Source module
//!
//! Used to fetch updates of subtitle groups from source websites/feeds.

use forrit_config::{RssConfig, SourcerType, get_config};
use forrit_core::model::{BsonEntry, ListParam, ListResult, PartialEntry, WithId};
use mongodb::{
    bson::{Bson, doc, oid::ObjectId},
    options::{UpdateModifications, UpdateOptions},
};
use ractor::{Actor, ActorCell};
use tap::Pipe;
use tracing::warn;

use crate::{
    REQ,
    db::{Collections, CrudResult, MongoResult, Storage, Wrapping, impl_resource},
    util::Boom,
};

mod acg_rip;
mod rss;

pub type EntryStorage = Storage<PartialEntry, BsonEntry>;

pub async fn start(db: &Collections, supervisor: ActorCell) -> Vec<ActorCell> {
    let config = &get_config().sourcer;

    if config.is_empty() {
        warn!("No sourcer enabled, nothing will be fetched nor downloaded.");
    }

    let mut ret = Vec::with_capacity(config.len());

    for (id, conf) in config.iter("rss-") {
        if !conf.enable {
            continue;
        }

        match &conf.ty {
            SourcerType::Rss(rss_conf) => {
                let actor = rss::RssActor::new(rss_conf, REQ.clone(), db.entry.clone(), id.clone());
                let (actor_ref, _) =
                    Actor::spawn_linked(format!("sourcer-{id}").pipe(Some), actor, (), supervisor.clone())
                        .await
                        .boom("Failed to spawn rss actor");
                ret.push(actor_ref.get_cell());
            }
            SourcerType::AcgRip(config) => {
                let rss_url = config.rss_url().to_url();
                tracing::info!("Starting acg-rip sourcer with RSS feed: {rss_url}");
                let rss_config = RssConfig {
                    url: rss_url,
                    update_interval: config.update_interval,
                    deny_non_torrent: config.deny_non_torrent,
                }
                .pipe(Box::new)
                .pipe(Box::leak);
                let rss_actor = rss::RssActor::new(rss_config, REQ.clone(), db.entry.clone(), id.clone());
                let actor = acg_rip::AcgRipActor::new(config, rss_actor);
                let (actor_ref, _) =
                    Actor::spawn_linked(format!("sourcer-{id}").pipe(Some), actor, (), supervisor.clone())
                        .await
                        .boom("Failed to spawn acg-rip actor");
                ret.push(actor_ref.get_cell());
            }
        }
    }

    ret
}

#[derive(Debug)]
pub enum SourcerMessage {
    LoadHistory,
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

impl_resource!(BsonEntry, sort_by bson_pub_date, field(guid, torrent_name, meta_id));

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

    // pub async fn get_by_info_hash(&self, info_hash: &str) ->
    // MongoResult<Option<WithId<PartialEntry>>> {     self.get
    //         .find_one(doc! { BsonEntryIdx::INFO_HASH: info_hash }, None)
    //         .await
    // }

    pub async fn exist(&self, torrent_name: &str, only_resolved: bool) -> MongoResult<bool> {
        let mut query = doc! { BsonEntryIdx::TORRENT_NAME: torrent_name };
        if only_resolved {
            query.insert(BsonEntryIdx::META_ID, doc! { "$ne": null });
        };
        self.get.find_one(query, None).await?.is_some().pipe(Ok)
    }

    pub async fn upsert(&self, entry: PartialEntry) -> MongoResult<BsonEntry> {
        let entry = BsonEntry::from(entry);
        let doc = mongodb::bson::to_document(&entry).expect("Failed to convert entry to bson Document");

        self.set
            .update_one(
                doc! { BsonEntryIdx::GUID: &entry.guid },
                UpdateModifications::Document(doc! { "$set": doc }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await?;

        Ok(entry)
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

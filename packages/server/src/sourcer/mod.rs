//! Source module
//!
//! Used to fetch updates of subtitle groups from source websites/feeds.

use forrit_core::model::{PartialEntry, WithId};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::{IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use ractor::{Actor, ActorProcessingErr, ActorRef};
use tap::Pipe;
use tracing::{info, warn};

use crate::{
    config::{get_config, SourcerType},
    db::{Collections, CrudMessage, FromCrud, GetSet, MongoResult},
    util::Boom,
    REQ,
};

mod rss;

pub async fn start(db: &Collections) {
    let config = &get_config().sourcer;

    if config.is_empty() {
        warn!("No sourcer enabled, nothing will be fetched nor downloaded.");
    }

    Actor::spawn(Some(EntryActor::NAME.to_owned()), EntryActor(db.entry.clone()), ())
        .await
        .boom("Failed to spawn entry actor");

    for (id, conf) in config.iter() {
        if !conf.enable {
            continue;
        }
        match &conf.ty {
            SourcerType::Rss(rss_conf) => {
                let actor = rss::RssActor::new(rss_conf, REQ.clone(), db.entry.clone());
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

pub struct EntryMessage(CrudMessage<PartialEntry>);

impl FromCrud<PartialEntry> for EntryMessage {
    const ACTOR_NAME: &'static str = EntryActor::NAME;
    const RESOURCE_NAME: &'static str = "entry";

    fn from_crud(crud: CrudMessage<PartialEntry>) -> Self {
        Self(crud)
    }
}

pub struct EntryActor(EntryStorage);

impl EntryActor {
    const NAME: &'static str = "entry";

    async fn create_indexes(&self) -> MongoResult<()> {
        self.0.create_indexes().await
    }
}

impl Actor for EntryActor {
    type Arguments = ();
    type Msg = EntryMessage;
    type State = ();

    async fn pre_start(&self, _: ActorRef<Self::Msg>, _: Self::Arguments) -> Result<Self::State, ActorProcessingErr> {
        info!("Entry actor starting");
        self.create_indexes().await?;
        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self::Msg>,
        msg: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        self.0.handle_crud(msg.0).await;
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct EntryStorage(GetSet<PartialEntry>);

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

    pub async fn handle_crud(&self, msg: CrudMessage<PartialEntry>) {
        self.0.handle_crud(msg).await
    }

    pub async fn get(&self, guid: &str) -> MongoResult<Option<WithId<PartialEntry>>> {
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

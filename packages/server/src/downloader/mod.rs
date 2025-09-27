//! Download module
//!
//! Download torrents

use camino::Utf8PathBuf;
use forrit_config::{DownloaderConfig, DownloaderType, get_config};
use forrit_core::model::{DownloadState, Job, Meta, PartialEntry, WithId};
use futures::{TryStream, TryStreamExt};
use mongodb::{
    bson::{doc, oid::ObjectId},
    results::UpdateResult,
};
use ractor::{Actor, ActorCell};
use tap::Pipe;
use tracing::warn;

use crate::{
    REQ,
    db::{Collections, MongoResult, Storage, impl_resource},
    downloader::qbit::QbitActor,
    resolver,
    sourcer::EntryStorage,
    util::Boom,
};
pub const NAME: &str = "downloader";

mod qbit;

impl_resource!(Job, field(subscription_id, meta_id, entry_id, state, name),);

pub fn job_added(job_id: ObjectId) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewDownloadAdded(job_id)));
}

impl Storage<Job> {
    pub async fn get_by_entry(&self, entry_id: ObjectId) -> MongoResult<Vec<WithId<Job>>> {
        self.get
            .find(doc! { JobIdx::ENTRY_ID: entry_id }, None)
            .await?
            .try_collect()
            .await
    }
}

/// A prepared download job
#[derive(Debug)]
pub struct Prepared {
    download: Job,
    entry: WithId<PartialEntry>,
    meta: Option<WithId<Meta>>,
    path: Utf8PathBuf,
}

#[derive(Debug, Clone)]
pub struct DownloadManager {
    jobs: Storage<Job>,
    entry: EntryStorage,
    config: &'static DownloaderConfig,
}

impl DownloadManager {
    fn new(db: &Collections, config: &'static DownloaderConfig) -> Self {
        Self {
            entry: db.entry.clone(),
            jobs: db.jobs.clone(),
            config,
        }
    }

    async fn pending_jobs(&self) -> MongoResult<impl TryStream<Ok = WithId<Job>, Error = mongodb::error::Error>> {
        self.jobs
            .get
            .find(doc! { "state": DownloadState::Pending.to_str() }, None)
            .await?
            .pipe(Ok)
    }

    async fn downloading_jobs(&self) -> MongoResult<impl TryStream<Ok = WithId<Job>, Error = mongodb::error::Error>> {
        self.jobs
            .get
            .find(doc! { "state": DownloadState::Downloading.to_str() }, None)
            .await?
            .pipe(Ok)
    }

    async fn update_state(&self, job_id: ObjectId, state: DownloadState) -> MongoResult<UpdateResult> {
        self.jobs
            .set
            .update_one(doc! { "_id": job_id }, doc! {"$set": { "state": state.to_str() }}, None)
            .await
    }

    async fn prepare(&self, job: Job) -> MongoResult<Option<Prepared>> {
        let Some(entry) = self.entry.get_one(job.entry_id).await? else {
            warn!(job = %job.entry_id, "Entry not found for download job, skip");
            return Ok(None);
        };
        let meta = try { resolver::get_one(job.meta_id?).await? };

        let path = if let Some(meta) = &meta {
            job.get_path(meta)
        } else {
            warn!(meta=?job.meta_id, "Not meta found");
            entry.base.title.as_str().into()
        };

        Prepared {
            download: job,
            entry,
            meta,
            path,
        }
        .pipe(Some)
        .pipe(Ok)
    }
}

pub async fn start(db: &Collections, supervisor: ActorCell) -> ActorCell {
    let config = &get_config().downloader;
    let manager = DownloadManager::new(db, config);

    match &config.ty {
        DownloaderType::Disabled => {
            warn!("Downloader is disabled in the configuration");
            Actor::spawn_linked(Some(NAME.to_owned()), DummyDownloader {}, (), supervisor)
                .await
                .boom("Failed to spawn dummy downloader actor")
                .0
                .get_cell()
        }
        DownloaderType::Transmission(_) => todo!("Transmission downloader is not yet implemented"),
        DownloaderType::Qbittorrent(qb_conf) => {
            let actor = QbitActor::new(REQ.clone(), qb_conf, manager);
            Actor::spawn_linked(Some(NAME.to_owned()), actor, (), supervisor)
                .await
                .boom("Failed to spawn downloader actor")
                .0
                .get_cell()
        }
    }
}

#[derive(Debug)]
pub enum Message {
    /// A new download job is added
    NewDownloadAdded(ObjectId),

    /// Periodically rename files
    Rename,

    /// Periodically check download status
    Check,
}

struct DummyDownloader;

impl Actor for DummyDownloader {
    type Arguments = ();
    type Msg = Message;
    type State = ();

    async fn pre_start(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        Ok(())
    }

    async fn handle(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            Message::NewDownloadAdded(job_id) => {
                warn!(job_id=%job_id, "Downloader is disabled, cannot process new download job");
            }
            Message::Rename => {
                // No-op
            }
            Message::Check => {
                // No-op
            }
        }
        Ok(())
    }
}

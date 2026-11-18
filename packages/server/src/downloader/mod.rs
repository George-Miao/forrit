//! Download module
//!
//! Download torrents

use std::sync::Arc;

use backon::Retryable;
use camino::Utf8PathBuf;
use forrit_config::{Config, DownloaderConfig, DownloaderType};
use forrit_core::model::{DownloadState, Job, PartialEntry, WithId};
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId},
    results::UpdateResult,
};
use ractor::{Actor, ActorCell};
use tap::Pipe;
use tracing::warn;

use crate::{
    db::{Collections, MongoResult, Storage, impl_resource},
    downloader::qbit::QbitActor,
    resolver,
    sourcer::EntryStorage,
    util::{Boom, retry_backoff},
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
            .find(doc! { JobIdx::ENTRY_ID: entry_id })
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
    path: Utf8PathBuf,
}

#[derive(Debug, Clone)]
pub struct DownloadManager {
    jobs: Storage<Job>,
    entry: EntryStorage,
    config: Arc<DownloaderConfig>,
}

impl DownloadManager {
    fn new(db: &Collections, config: Arc<DownloaderConfig>) -> Self {
        Self {
            entry: db.entry.clone(),
            jobs: db.jobs.clone(),
            config,
        }
    }

    async fn pending_jobs(&self) -> MongoResult<Vec<WithId<Job>>> {
        (|| async {
            self.jobs
                .get
                .find(doc! { "state": DownloadState::Pending.to_str() })
                .await?
                .try_collect()
                .await
        })
        .retry(retry_backoff())
        .notify(|error, delay| {
            warn!(%error, ?delay, "Failed to load pending download jobs, retrying");
        })
        .await
    }

    async fn downloading_jobs(&self) -> MongoResult<Vec<WithId<Job>>> {
        (|| async {
            self.jobs
                .get
                .find(doc! { "state": DownloadState::Downloading.to_str() })
                .await?
                .try_collect()
                .await
        })
        .retry(retry_backoff())
        .notify(|error, delay| {
            warn!(%error, ?delay, "Failed to load active download jobs, retrying");
        })
        .await
    }

    async fn update_state(&self, job_id: ObjectId, state: DownloadState) -> MongoResult<UpdateResult> {
        let state = state.to_str().to_owned();
        (|| {
            let state = state.clone();
            async move {
                self.jobs
                    .set
                    .update_one(doc! { "_id": job_id }, doc! {"$set": { "state": state }})
                    .await
            }
        })
        .retry(retry_backoff())
        .notify(|error, delay| {
            warn!(%error, ?delay, %job_id, "Failed to update download state, retrying");
        })
        .await
    }

    async fn prepare(&self, job: Job) -> MongoResult<Option<Prepared>> {
        let entry = (|| self.entry.get_one(job.entry_id))
            .retry(retry_backoff())
            .notify(|error, delay| {
                warn!(%error, ?delay, entry_id = %job.entry_id, "Failed to load download entry, retrying");
            })
            .await?;
        let Some(entry) = entry else {
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
            path,
        }
        .pipe(Some)
        .pipe(Ok)
    }
}

pub async fn start(db: &Collections, supervisor: ActorCell, config: &Config) -> ActorCell {
    let config = Arc::new(config.downloader.clone());
    let manager = DownloadManager::new(db, config.clone());

    match &config.ty {
        DownloaderType::Disabled => {
            warn!("Downloader is disabled in the configuration");
            start_dummy(supervisor).await
        }
        DownloaderType::Transmission(_) => todo!("Transmission downloader is not yet implemented"),
        DownloaderType::Qbittorrent(qb_conf) => {
            let actor = QbitActor::new(Arc::new(qb_conf.clone()), manager);
            Actor::spawn_linked(Some(NAME.to_owned()), actor, (), supervisor)
                .await
                .boom("Failed to start qBittorrent downloader")
                .0
                .get_cell()
        }
    }
}

async fn start_dummy(supervisor: ActorCell) -> ActorCell {
    Actor::spawn_linked(Some(NAME.to_owned()), DummyDownloader {}, (), supervisor)
        .await
        .boom("Failed to spawn dummy downloader actor")
        .0
        .get_cell()
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

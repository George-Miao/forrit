//! Download module
//!
//! Download torrents

use camino::Utf8PathBuf;
use forrit_config::{get_config, DownloaderConfig, DownloaderType};
use forrit_core::model::{Download, DownloadState, Meta, PartialEntry, WithId};
use mongodb::{
    bson::{doc, oid::ObjectId},
    results::UpdateResult,
};
use ractor::Actor;
use tap::Pipe;
use tracing::warn;

use crate::{
    db::{impl_resource, Collections, MongoResult, Storage},
    downloader::qbit::QbitActor,
    resolver,
    sourcer::EntryStorage,
    util::Boom,
    REQ,
};
pub const NAME: &str = "downloader";

mod qbit;

impl_resource!(Download, field(subscription_id, meta_id, entry_id, state));

pub fn new_download(job: Download) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewDownload(job)));
}

pub fn download_added(id: ObjectId) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewDownloadAdded(id)));
}

/// A prepared download job
#[derive(Debug)]
pub struct Prepared {
    download: Download,
    entry: WithId<PartialEntry>,
    meta: Option<WithId<Meta>>,
    path: Utf8PathBuf,
}

#[derive(Debug, Clone)]
pub struct DownloadManager {
    download: Storage<Download>,
    entry: EntryStorage,
    config: &'static DownloaderConfig,
}

impl DownloadManager {
    fn new(db: &Collections, config: &'static DownloaderConfig) -> Self {
        Self {
            entry: db.entry.clone(),
            download: db.download.clone(),
            config,
        }
    }

    async fn update_state(&self, id: ObjectId, state: DownloadState) -> MongoResult<UpdateResult> {
        self.download
            .set
            .update_one(
                doc! { "_id": id },
                doc! {
                    "$set": { "state": state.to_str() }
                },
                None,
            )
            .await
    }

    async fn prepare(&self, job: Download) -> MongoResult<Option<Prepared>> {
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

pub async fn start(db: &Collections) {
    let config = &get_config().downloader;
    let manager = DownloadManager::new(db, config);

    match &config.ty {
        DownloaderType::Transmission(_) => todo!("Transmission downloader is not yet implemented"),
        DownloaderType::Qbittorrent(qb_conf) => {
            let actor = QbitActor::new(REQ.clone(), qb_conf, manager);
            Actor::spawn(Some(NAME.to_owned()), actor, ())
                .await
                .boom("Failed to spawn downloader actor");
        }
    }
}

pub enum Message {
    NewDownload(Download),
    NewDownloadAdded(ObjectId),
    Rename,
}

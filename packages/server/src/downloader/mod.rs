//! Download module
//!
//! Download torrents

use camino::{Utf8Path, Utf8PathBuf};
use mongodb::Database;
use ractor::Actor;

use crate::{
    config::{get_config, DownloaderType},
    db::WithId,
    downloader::qbit::QbitActor,
    resolver::Meta,
    sourcer::Entry,
    util::Boom,
    REQ,
};

pub const NAME: &str = "downloader";

mod qbit;

pub fn new_job(job: Job) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewJob(job)));
}

pub async fn start(_db: &Database) {
    let config = &get_config().downloader;

    match &config.ty {
        DownloaderType::Transmission(_) => todo!("Transmission downloader is not yet implemented"),
        DownloaderType::Qbittorrent(qb) => {
            let actor = QbitActor::new(REQ.clone(), qb);
            Actor::spawn(Some(NAME.to_owned()), actor, ())
                .await
                .boom("Failed to spawn downloader actor");
        }
    }
}

#[derive(Debug, Clone)]
pub struct Job {
    pub meta: WithId<Meta>,
    pub entry: WithId<Entry>,
    pub directory_override: Option<Utf8PathBuf>,
}

impl Job {
    pub fn path(&self, savepath: impl AsRef<Utf8Path>) -> Utf8PathBuf {
        let name = self
            .directory_override
            .as_ref()
            .map(|path| path.as_str())
            .or_else(|| self.meta.tv.as_ref().map(|tv| tv.inner.original_name.as_str()))
            .or_else(|| self.meta.original_title())
            .unwrap_or(&self.meta.title);
        let season = self.meta.inner.season_number().unwrap_or(1);
        savepath.as_ref().join(name).join(format!("S{season}"))
    }
}

pub enum Message {
    NewJob(Job),
    Rename,
}

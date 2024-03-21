//! Download module
//!
//! Download torrents

use forrit_core::model::Job;
use ractor::Actor;

use crate::{
    config::{get_config, DownloaderType},
    db::Collections,
    downloader::qbit::QbitActor,
    util::Boom,
    REQ,
};
pub const NAME: &str = "downloader";

mod qbit;

pub fn new_job(job: Job) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewJob(job)));
}

pub async fn start(_db: &Collections) {
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

pub enum Message {
    NewJob(Job),
    Rename,
}

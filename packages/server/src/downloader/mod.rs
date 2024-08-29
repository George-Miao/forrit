//! Download module
//!
//! Download torrents

use forrit_config::{get_config, DownloaderType};
use forrit_core::model::Download;
use ractor::Actor;

use crate::{
    db::{impl_resource, Collections},
    downloader::qbit::QbitActor,
    util::Boom,
    REQ,
};
pub const NAME: &str = "downloader";

mod qbit;

impl_resource!(Download, field(subscription_id, meta_id, entry_id, state));

pub fn new_download(job: Download) {
    ractor::registry::where_is(NAME.to_owned()).map(|sub| sub.send_message(Message::NewDownload(job)));
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
    NewDownload(Download),
    Rename,
}

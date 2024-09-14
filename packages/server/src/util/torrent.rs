use std::fmt::Debug;

use bt_bencode::from_slice;
use ractor::ActorProcessingErr;
use tap::Pipe;

use crate::REQ;

pub async fn get_torrent_name(url: &str) -> Result<String, ActorProcessingErr> {
    #[derive(Debug, serde::Deserialize)]
    struct Torrent {
        info: Info,
    }

    #[derive(Debug, serde::Deserialize)]
    struct Info {
        name: String,
    }

    REQ.get(url)
        .send()
        .await?
        .bytes()
        .await?
        .pipe(|bytes| from_slice::<Torrent>(&bytes))?
        .info
        .name
        .pipe(Ok)
}

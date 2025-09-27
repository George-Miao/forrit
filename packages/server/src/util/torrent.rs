use std::collections::BTreeMap;

use bt_bencode::{ByteString, Value, from_slice, value::Number};
use ractor::ActorProcessingErr;
use rustc_hex::ToHex;
use serde::{Deserialize, Serialize};
use sha1::Digest;
use tap::Pipe;

use crate::REQ;

#[derive(Debug, Deserialize)]
struct Torrent {
    info: Info,
}

impl Torrent {
    fn info_hash(&self) -> String {
        let info_bytes = bt_bencode::to_vec(&self.info).expect("Failed to encode info dict");
        sha1::Sha1::digest(&info_bytes).to_vec().to_hex::<String>()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Info {
    #[serde(rename = "meta version")]
    #[serde(skip_serializing_if = "Option::is_none")]
    version: Option<u64>,

    name: String,

    /// Torrent `piece length` as used in v1/v2 torrents
    ///
    /// Maximum size is 536854528 like in libtorrent.
    #[serde(rename = "piece length")]
    piece_length: u32,

    // Torrent v1/hybrid (only for single-file torrents)
    #[serde(skip_serializing_if = "Option::is_none")]
    length: Option<u64>,

    // Torrent v1 (only for multi-files torrents)
    #[serde(skip_serializing_if = "Option::is_none")]
    files: Option<Vec<Value>>,

    // Torrent v2 (for both single and multi-files torrents)
    #[serde(rename = "file tree")]
    #[serde(skip_serializing_if = "Option::is_none")]
    file_tree: Option<Value>,

    // Rest of info dict that we keep for hashing
    #[serde(flatten)]
    #[serde(skip_serializing_if = "BTreeMap::is_empty")]
    extra: BTreeMap<String, Value>,
}

pub struct TorrentInfo {
    pub name: String,
    pub info_hash: String,
    pub size: u64,
}

pub fn number_to_u64(n: &Number) -> u64 {
    match n {
        Number::Signed(x) => *x as _,
        Number::Unsigned(x) => *x as _,
    }
}

pub async fn get_torrent_info(url: &str) -> Result<TorrentInfo, ActorProcessingErr> {
    let torrent = REQ
        .get(url)
        .send()
        .await?
        .bytes()
        .await?
        .pipe(|bytes| from_slice::<Torrent>(&bytes))?;

    let info_hash = torrent.info_hash();
    let size = if let Some(length) = torrent.info.length {
        Some(length)
    } else if let Some(files) = &torrent.info.files {
        // Multi-file torrent
        files.iter().try_fold(0u64, |acc, file| {
            if let Value::Dict(d) = file
                && let Some(Value::Int(len)) = d.get(&ByteString::from("length"))
            {
                return Some(acc + number_to_u64(len));
            }
            None
        })
    } else if let Some(Value::Dict(file_tree)) = &torrent.info.file_tree {
        // V2 torrent
        file_tree.values().try_fold(0u64, |acc, file| {
            if let Value::Dict(d) = file
                && let Some(Value::Int(len)) = d.get(&ByteString::from("length"))
            {
                return Some(acc + number_to_u64(len));
            }
            None
        })
    } else {
        None
    };

    Ok(TorrentInfo {
        name: torrent.info.name,
        info_hash,
        size: size.unwrap_or_default(),
    })
}

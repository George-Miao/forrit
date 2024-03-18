//! Source module
//!
//! Used to fetch updates of subtitle groups from source websites/feeds.

use std::ops::Deref;

use chrono::{DateTime, FixedOffset};
use mongodb::{bson::oid::ObjectId, Database};
use ractor::Actor;
use serde::{Deserialize, Serialize};
use tap::Pipe;
use tracing::warn;
use url::Url;

use crate::{
    config::{get_config, SourcerType},
    util::Boom,
    REQ,
};

mod rss;

pub async fn start(db: &Database) {
    let config = &get_config().sourcer;
    let entries = db.collection("entries");

    if config.is_empty() {
        warn!("No sourcer is enabled, nothing will be fetched nor downloaded.");
    }

    for (id, conf) in config.iter() {
        if !conf.enable {
            continue;
        }
        match &conf.ty {
            SourcerType::Rss(rss_conf) => {
                let actor = rss::RssActor::new(rss_conf, REQ.clone(), entries.clone());
                Actor::spawn(format!("sourcer-{id}").pipe(Some), actor, ())
                    .await
                    .boom("Failed to spawn rss actor");
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    Update,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EntryBase {
    pub guid: String,
    pub title: String,
    pub description: Option<String>,
    pub torrent: Url,
    pub pub_date: Option<DateTime<FixedOffset>>,
    pub link: Option<Url>,
    pub group: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PartialEntry {
    #[serde(flatten)]
    pub base: EntryBase,
    pub meta_id: Option<ObjectId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entry {
    #[serde(flatten)]
    pub base: EntryBase,
    pub meta_id: ObjectId,
}

impl Deref for Entry {
    type Target = EntryBase;

    fn deref(&self) -> &Self::Target {
        &self.base
    }
}

impl Deref for PartialEntry {
    type Target = EntryBase;

    fn deref(&self) -> &Self::Target {
        &self.base
    }
}

impl PartialEntry {
    pub fn into_entry(self) -> Option<Entry> {
        Some(Entry {
            base: self.base,
            meta_id: self.meta_id?,
        })
    }
}

use std::borrow::Borrow;

use chrono::DateTime;
use forrit_core::IntoStream;
use futures::StreamExt;
use mongodb::{bson::doc, options::IndexOptions, Collection, IndexModel};
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef};
use reqwest::Client;
use tap::Pipe;
use tracing::{debug, info, instrument, warn};

use crate::{
    config::RssConfig,
    db::{GetSet, WithId},
    sourcer::{EntryBase, Message, PartialEntry},
    subscription::new_entry,
    util::Boom,
};

pub struct RssActor {
    client: Client,
    config: &'static RssConfig,
    entries: GetSet<PartialEntry>,
}

pub struct State {
    update_job: JoinHandle<()>,
}

impl RssActor {
    const GUID_INDEX: &'static str = "guid";

    pub fn new(config: &'static RssConfig, client: Client, entries: Collection<PartialEntry>) -> Self {
        Self {
            client,
            config,
            entries: GetSet::new(entries),
        }
    }

    async fn create_indexes(&self) -> Result<(), mongodb::error::Error> {
        self.entries
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

    #[instrument(skip_all, fields(title = &item.title, guid = item.guid.as_ref().map(|x| &x.value)))]
    async fn handle_item(&self, item: rss::Item) -> Option<PartialEntry> {
        let guid = item.guid?;
        if self
            .entries
            .get
            .find_one(doc! { Self::GUID_INDEX: &guid.value }, None)
            .await
            .expect("db error")
            .is_some()
        {
            debug!("Entry already exists");
            return None;
        }
        let link = if let Some(link) = item.link {
            link.parse().ok()
        } else if guid.permalink {
            guid.value.parse().ok()
        } else {
            None
        };
        let title = item.title?.to_owned();
        let closure = item.enclosure?;
        let torrent = closure.url.parse().ok()?;
        if closure.mime_type.as_str() != "application/x-bittorrent" {
            warn!(
                guid = guid.value,
                mime_type = closure.mime_type.as_str(),
                "None torrent file found"
            );
            if self.config.deny_non_torrent {
                warn!("deny_non_torrent enabled, skipping");
                return None;
            }
        }
        let resolved = crate::resolver::resolve(title.to_owned()).await;
        if resolved.meta.is_none() {
            warn!("Failed to extract resolve title");
        }
        let pub_date = try { DateTime::parse_from_rfc2822(item.pub_date?.as_str()).ok()? };

        let base = EntryBase {
            guid: guid.value,
            link,
            description: item.description,
            title,
            pub_date,
            torrent,
            group: resolved.group,
        };

        Some(PartialEntry {
            base,
            meta_id: resolved.meta.map(|x| x.id),
        })
    }
}

impl Actor for RssActor {
    type Arguments = ();
    type Msg = Message;
    type State = State;

    async fn pre_start(
        &self,
        this: ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        info!("RSS Actor starting");

        self.create_indexes().await.boom("Failed to create index for rss");

        ractor::time::send_interval(self.config.update_interval, this.get_cell(), || Message::Update)
            .pipe(|update_job| State { update_job })
            .pipe(Ok)
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        state.update_job.abort();
        Ok(())
    }

    #[instrument(skip_all)]
    async fn handle(
        &self,
        _: ActorRef<Self::Msg>,
        msg: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            Message::Update => {
                let bytes = self.client.get(self.config.url.clone()).send().await?.bytes().await?;

                rss::Channel::read_from(&bytes[..])?
                    .into_items()
                    .into_stream()
                    .for_each_concurrent(None, |item| async {
                        let Some(partial) = self.handle_item(item).await else {
                            return;
                        };
                        let id = self
                            .entries
                            .set
                            .insert_one(&partial, None)
                            .await
                            .expect("db error")
                            .inserted_id
                            .as_object_id()
                            .expect("mongo returned non-oid type for inserted object");
                        if let Some(entry) = partial.into_entry() {
                            new_entry(WithId { id, inner: entry });
                        }
                    })
                    .await;
            }
        }

        Ok(())
    }
}

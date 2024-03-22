use chrono::DateTime;
use forrit_core::{model::EntryBase, IntoStream};
use futures::StreamExt;
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef};
use reqwest::Client;
use tap::Pipe;
use tracing::{debug, info, instrument};

use crate::{
    config::RssConfig,
    sourcer::{EntryStorage, PartialEntry, SourcerMessage},
    subscription::new_entry,
};

pub struct RssActor {
    client: Client,
    config: &'static RssConfig,
    entry: EntryStorage,
}

pub struct State {
    update_job: JoinHandle<()>,
}

impl RssActor {
    pub fn new(config: &'static RssConfig, client: Client, entry: EntryStorage) -> Self {
        Self { client, config, entry }
    }

    #[instrument(skip_all, fields(title = &item.title, guid = item.guid.as_ref().map(|x| &x.value)))]
    async fn handle_item(&self, item: rss::Item) -> Option<PartialEntry> {
        let guid = item.guid?;
        if self.entry.exist(&guid.value, true).await.expect("db error") {
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
            info!(
                guid = guid.value,
                mime_type = closure.mime_type.as_str(),
                "None torrent file found"
            );
            if self.config.deny_non_torrent {
                info!("deny_non_torrent enabled, skipping");
                return None;
            }
        }
        let resolved = crate::resolver::resolve(title.to_owned()).await;
        let pub_date = try { DateTime::parse_from_rfc2822(item.pub_date?.as_str()).ok()? };
        let elements = resolved
            .elements
            .iter()
            .map(|x| (format!("{:?}", x.category), x.value.clone()))
            .collect();

        let base = EntryBase {
            guid: guid.value,
            link,
            description: item.description,
            title,
            pub_date,
            torrent,
            group: resolved.group,
            elements,
        };

        Some(PartialEntry {
            base,
            meta_id: resolved.meta.map(|x| x.id),
        })
    }
}

impl Actor for RssActor {
    type Arguments = ();
    type Msg = SourcerMessage;
    type State = State;

    async fn pre_start(
        &self,
        this: ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        info!("RSS actor starting");

        this.send_message(SourcerMessage::Update)?;
        ractor::time::send_interval(self.config.update_interval, this.get_cell(), || SourcerMessage::Update)
            .pipe(|update_job| State { update_job })
            .pipe(Ok)
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        state.update_job.abort();
        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self::Msg>,
        msg: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            SourcerMessage::Update => {
                let bytes = self.client.get(self.config.url.clone()).send().await?.bytes().await?;

                rss::Channel::read_from(&bytes[..])?
                    .into_items()
                    .into_stream()
                    .for_each_concurrent(None, |item| async {
                        let Some(partial) = self.handle_item(item).await else {
                            return;
                        };
                        self.entry.upsert(&partial).await.expect("db error");
                        if let Some(entry) = partial.into_entry() {
                            new_entry(entry);
                        }
                    })
                    .await;
            }
        }

        Ok(())
    }
}

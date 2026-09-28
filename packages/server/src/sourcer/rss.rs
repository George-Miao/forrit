use std::sync::Arc;

use chrono::DateTime;
use forrit_config::RssConfig;
use forrit_core::{IntoStream, model::EntryBase};
use futures::StreamExt;
use ractor::{Actor, ActorProcessingErr, ActorRef, concurrency::JoinHandle};
use reqwest::Client;
use tap::Pipe;
use tracing::{debug, info, instrument, warn};
use url::Url;

use crate::{
    dispatcher::new_entry,
    sourcer::{EntryStorage, PartialEntry, SourcerMessage},
    util::get_torrent_info,
};

#[derive(Clone)]
pub struct RssActor {
    client: Client,
    config: Arc<RssConfig>,
    entry: EntryStorage,
    name: String,
}

pub struct State {
    update_job: JoinHandle<()>,
}

impl RssActor {
    pub fn new(config: Arc<RssConfig>, client: Client, entry: EntryStorage, name: String) -> Self {
        Self {
            client,
            config,
            entry,
            name,
        }
    }

    pub async fn load_url(&self, url: &str) -> Result<(), ActorProcessingErr> {
        self.load_url_with(url, Some).await
    }

    pub async fn load_url_with(
        &self,
        url: &str,
        prepare_item: impl Fn(rss::Item) -> Option<rss::Item>,
    ) -> Result<(), ActorProcessingErr> {
        let bytes = self.client.get(url).send().await?.error_for_status()?.bytes().await?;

        rss::Channel::read_from(&bytes[..])?
            .into_items()
            .into_iter()
            .filter_map(prepare_item)
            .into_stream()
            .for_each_concurrent(None, |item| async {
                let Some(partial) = self.handle_item(item).await else {
                    return;
                };
                let partial = self.entry.upsert(partial).await.expect("db error");
                if let Some(entry) = partial.inner.into_entry() {
                    new_entry(entry);
                }
            })
            .await;

        Ok(())
    }

    #[instrument(skip_all, fields(title = &item.title, guid = item.guid.as_ref().map(|x| &x.value)))]
    async fn handle_item(&self, item: rss::Item) -> Option<PartialEntry> {
        let guid = item.guid?;
        let link = if let Some(link) = item.link {
            link.parse().ok()
        } else if guid.permalink {
            guid.value.parse().ok()
        } else {
            None
        };
        let title = item.title?.to_owned();
        let closure = item.enclosure?;
        let Ok(torrent) = Url::parse(&closure.url) else {
            debug!("Failed to parse torrent URL");
            return None;
        };

        let info = match get_torrent_info(torrent.as_str()).await {
            Ok(info) => info,
            Err(error) => {
                debug!(%error, "Failed to get torrent info");
                return None;
            }
        };

        if self.entry.exist(&info.name, true).await.expect("db error") {
            debug!("Entry already exists");
            return None;
        }

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
            sourcer: self.name.clone(),
            guid: guid.value,
            link,
            description: item.description,
            title,
            pub_date,
            info_hash: info.info_hash,
            torrent_name: info.name,
            torrent,
            size: info.size,
            mime_type: closure.mime_type,
            group: resolved.group,
            elements,
        };

        let (meta_title, meta_id) = if let Some(meta) = resolved.meta {
            (Some(meta.inner.into_proper_title()), Some(meta.id))
        } else {
            (None, None)
        };

        Some(PartialEntry {
            base,
            meta_title,
            meta_id,
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
                debug!(actor = self.name, "Updating RSS");
                if let Err(error) = self.load_url(self.config.url.as_str()).await {
                    warn!(
                        actor = self.name,
                        url = %self.config.url,
                        %error,
                        "Failed to update RSS feed"
                    );
                }
            }
            SourcerMessage::LoadHistory => {
                // No-op
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::{sync::Arc, time::Duration};

    use forrit_config::RssConfig;
    use mongodb::Client as MongoClient;
    use ractor::Actor;
    use reqwest::Client;
    use tokio::net::TcpListener;
    use url::Url;

    use super::RssActor;
    use crate::{
        db::Storage,
        search::BsonEntry,
        sourcer::{EntryStorage, SourcerMessage},
    };

    #[tokio::test]
    async fn request_failure_does_not_stop_actor() {
        let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
        let address = listener.local_addr().unwrap();
        let server = tokio::spawn(async move {
            let (stream, _) = listener.accept().await.unwrap();
            drop(stream);
        });
        let database = MongoClient::with_uri_str("mongodb://127.0.0.1:1")
            .await
            .unwrap()
            .database("forrit_rss_test");
        let collection = database.collection::<BsonEntry>("entry");
        let entry: EntryStorage = Storage {
            get: collection.clone_with_type(),
            set: collection,
        };
        let config = Arc::new(RssConfig {
            url: Url::parse(&format!("http://{address}/feed.xml")).unwrap(),
            update_interval: Duration::from_secs(3600),
            deny_non_torrent: false,
        });
        let (actor, handle) = Actor::spawn(None, RssActor::new(config, Client::new(), entry, "test".to_owned()), ())
            .await
            .unwrap();

        server.await.unwrap();
        tokio::time::sleep(Duration::from_millis(50)).await;

        assert!(
            actor.send_message(SourcerMessage::Update).is_ok(),
            "a transient request failure must not stop the actor"
        );
        actor.stop(None);
        handle.await.unwrap();
    }
}

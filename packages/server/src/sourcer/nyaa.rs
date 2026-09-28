use std::{num::NonZeroU32, sync::Arc};

use forrit_config::NyaaConfig;
use ractor::Actor;
use rss::{Enclosure, Item};
use tracing::info;

use crate::sourcer::{
    SourcerMessage,
    rss::{RssActor, State},
};

#[derive(Clone)]
pub struct NyaaActor {
    config: Arc<NyaaConfig>,
    load_history: bool,
    rss: RssActor,
}

impl NyaaActor {
    pub fn new(config: Arc<NyaaConfig>, rss: RssActor, load_history: bool) -> Self {
        Self {
            config,
            load_history,
            rss,
        }
    }

    async fn load_page(&self, page: NonZeroU32) -> Result<(), ractor::ActorProcessingErr> {
        let url = self.config.rss_url(page);
        self.rss.load_url_with(url.as_str(), prepare_item).await
    }

    pub async fn load_history(&self) {
        let Some(pages) = self.config.load_history_pages else {
            return;
        };

        info!(pages = pages.get(), "Loading Nyaa history pages");

        for page in 1..=pages.get() {
            let page = NonZeroU32::new(page).expect("history page is non-zero");
            if let Err(error) = self.load_page(page).await {
                let url = self.config.rss_url(page);
                tracing::warn!(%error, %url, "Failed to load Nyaa history page");
                break;
            }
        }

        info!("Loading Nyaa history finished");
    }
}

fn prepare_item(mut item: Item) -> Option<Item> {
    if item.enclosure().is_none() {
        item.set_enclosure(Enclosure {
            url: item.link()?.to_owned(),
            length: "0".to_owned(),
            mime_type: "application/x-bittorrent".to_owned(),
        });
    }
    Some(item)
}

impl Actor for NyaaActor {
    type Arguments = ();
    type Msg = SourcerMessage;
    type State = State;

    async fn pre_start(
        &self,
        myself: ractor::ActorRef<Self::Msg>,
        args: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        if self.load_history {
            myself.send_message(SourcerMessage::LoadHistory)?;
        }
        self.rss.pre_start(myself, args).await
    }

    fn post_stop(
        &self,
        myself: ractor::ActorRef<Self::Msg>,
        state: &mut Self::State,
    ) -> impl Future<Output = Result<(), ractor::ActorProcessingErr>> + Send {
        self.rss.post_stop(myself, state)
    }

    async fn handle(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            SourcerMessage::LoadHistory => {
                let this = self.clone();
                tokio::spawn(async move {
                    this.load_history().await;
                });
            }
            SourcerMessage::Update => {
                self.load_page(NonZeroU32::MIN).await?;
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::prepare_item;

    #[test]
    fn uses_nyaa_link_as_torrent_enclosure_without_changing_description() {
        let description = "<a href=\"https://nyaa.si/view/123\">original</a>";
        let mut item = ::rss::Item::default();
        item.set_link("https://nyaa.si/download/123.torrent".to_owned());
        item.set_description(description.to_owned());

        let item = prepare_item(item).expect("Nyaa item with a link is valid");
        let enclosure = item.enclosure().expect("enclosure should be synthesized");

        assert_eq!(enclosure.url(), "https://nyaa.si/download/123.torrent");
        assert_eq!(enclosure.mime_type(), "application/x-bittorrent");
        assert_eq!(item.description(), Some(description));
    }
}

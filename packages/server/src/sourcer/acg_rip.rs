use forrit_config::AcgRipConfig;
use ractor::Actor;
use tracing::info;

use crate::sourcer::{
    SourcerMessage,
    rss::{self, RssActor},
};

#[derive(Clone)]
pub struct AcgRipActor {
    config: &'static AcgRipConfig,
    rss: RssActor,
}

impl AcgRipActor {
    pub fn new(config: &'static AcgRipConfig, rss: RssActor) -> Self {
        Self { config, rss }
    }

    pub async fn load_history(&self) {
        let Some(pages) = self.config.load_history_pages else {
            return;
        };

        info!("Loading history pages until {}", pages.get());

        for page in 1..=pages.get() {
            let url = format!(
                "https://acg.rip/{}page/{}.xml",
                self.config.zone.map_or_default(|z| format!("{}/", z)),
                page
            );
            if let Err(e) = self.rss.load_url(&url).await {
                tracing::warn!(%e, %url, "Failed to load history page");
                break;
            }
        }

        info!("Loading history finished");
    }
}

impl Actor for AcgRipActor {
    type Arguments = ();
    type Msg = crate::sourcer::SourcerMessage;
    type State = rss::State;

    async fn pre_start(
        &self,
        myself: ractor::ActorRef<Self::Msg>,
        args: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        myself.send_message(SourcerMessage::LoadHistory)?;
        let res = self.rss.pre_start(myself, args).await?;
        Ok(res)
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
        myself: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            SourcerMessage::LoadHistory => {
                let this = self.clone();
                tokio::spawn(async move {
                    this.load_history().await;
                });
                Ok(())
            }

            SourcerMessage::Update => self.rss.handle(myself, SourcerMessage::Update, state).await,
        }
    }
}

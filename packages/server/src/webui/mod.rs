use std::{io, sync::Arc};

use forrit_config::{get_config, WebUIConfig};
use forrit_webui::WebUI;
use ractor::{concurrency::JoinSet, Actor, ActorCell, ActorProcessingErr, ActorRef};
use tap::Pipe;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Child,
    task::JoinHandle,
};
use tracing::{debug, info};

use crate::{db::Collections, util::Boom};

pub async fn start(_: &Collections, supervisor: ActorCell) -> ActorCell {
    let config = &get_config().webui;

    Actor::spawn_linked(
        Some(WebUIActor::NAME.to_owned()),
        WebUIActor::new(config),
        (),
        supervisor,
    )
    .await
    .boom("Failed to spawn webui actor")
    .0
    .get_cell()
}

pub struct WebUIActor {
    config: &'static WebUIConfig,
}

pub struct State {
    webui: Arc<WebUI>,
    handle: JoinHandle<io::Result<()>>,
}

impl WebUIActor {
    pub const NAME: &'static str = "webui";

    pub fn new(config: &'static WebUIConfig) -> Self {
        Self { config }
    }
}

async fn trace_child(mut child: Child) -> io::Result<()> {
    let (stdout, stderr) = (child.stdout.take(), child.stderr.take());

    match (stdout, stderr) {
        (Some(stdout), Some(stderr)) => {
            let mut stdout = BufReader::new(stdout).lines();
            let mut stderr = BufReader::new(stderr).lines();

            let mut js = JoinSet::new();

            js.spawn(async move {
                while let Some(line) = stdout.next_line().await? {
                    info!("{line}");
                }

                io::Result::Ok(())
            });

            js.spawn(async move {
                while let Some(line) = stderr.next_line().await? {
                    debug!("{line}");
                }

                io::Result::Ok(())
            });

            js.join_all().await;

            Ok(())
        }
        _ => Err(io::Error::new(
            io::ErrorKind::Other,
            "Failed to capture child stdout/stderr",
        )),
    }
}

impl Actor for WebUIActor {
    type Arguments = ();
    type Msg = ();
    type State = State;

    async fn pre_start(
        &self,
        _: ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        info!("Web UI actor starting");

        let webui = WebUI::new(self.config.clone()).await?.pipe(Arc::new);

        let handle = tokio::spawn({
            let webui = webui.clone();
            async move {
                webui.extract().await?;
                info!("Web UI file extracted");
                trace_child(webui.install()?).await?;
                info!("Web UI installed");
                trace_child(webui.run()?).await?;

                Ok(())
            }
        });

        Ok(State { webui, handle })
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        state.handle.abort();

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use forrit_config::WebUIConfig;
    use ractor::Actor;
    use tracing::level_filters::LevelFilter;
    use tracing_subscriber::{filter::Targets, layer::SubscriberExt, util::SubscriberInitExt, Layer};

    use crate::webui::WebUIActor;

    #[tokio::test]
    async fn test_webui() {
        static CONFIG: WebUIConfig = WebUIConfig::new();

        let fmt_layer = tracing_subscriber::fmt::layer().without_time().with_filter(
            Targets::new()
                .with_default(LevelFilter::INFO)
                .with_target("forrit_server::resolver", LevelFilter::DEBUG)
                .with_target("rustls", LevelFilter::OFF),
        );

        tracing_subscriber::registry().with(fmt_layer).init();

        let (_, handle) = Actor::spawn(Some(WebUIActor::NAME.to_owned()), WebUIActor::new(&CONFIG), ())
            .await
            .unwrap();

        handle.await.unwrap();
    }
}

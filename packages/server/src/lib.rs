#![allow(clippy::large_enum_variant)]
#![feature(try_blocks, type_changing_struct_update, never_type, associated_type_defaults)]

pub mod api;
pub mod db;
pub mod dispatcher;
pub mod downloader;
pub mod notifier;
pub mod resolver;
pub mod sourcer;
pub mod test;
pub mod util;

#[cfg(feature = "webui")]
pub mod webui;

use std::{mem::take, sync::LazyLock, time::Duration};

use forrit_config::Config;
use futures::future::join4;
use mongodb::Client;
use ractor::{Actor, ActorCell, SpawnErr, SupervisionEvent, concurrency::sleep};
use tracing::{info, warn};

use crate::db::Collections;

const ACTOR_ERR: &str = "Actor is not running or registered";
const SEND_ERR: &str = "Failed to send message to actor";
const RECV_ERR: &str = "Failed to receive response from actor";

static REQ: LazyLock<reqwest::Client> = LazyLock::new(reqwest::Client::new);

pub struct Forrit {
    col: Collections,
    config: &'static Config,
}

impl Forrit {
    pub async fn new(config: &'static Config) -> Result<Self, ractor::ActorProcessingErr> {
        let mongo = Client::with_uri_str(&config.database.url).await?;
        let db = mongo.database(&config.database.database);
        let col = Collections::new(&db).await?;

        Ok(Forrit { col, config })
    }

    pub async fn run(self) -> Result<(), SpawnErr> {
        let col = self.col.clone();
        let conf = self.config;
        Actor::spawn(Some("supervisor".to_owned()), self, ()).await?;
        api::run(col, conf).await;
        Ok(())
    }
}

pub enum Message {
    Check,
}

#[derive(Debug, Clone)]
pub struct Running {
    resolver: ActorCell,
    downloader: ActorCell,
    sourcer: Vec<ActorCell>,
    dispatcher: ActorCell,
}

impl Running {
    async fn restart(&mut self, this: ActorCell, cell: ActorCell, col: &Collections) {
        sleep(Duration::from_secs(1)).await;
        let id = cell.get_id();

        if self.resolver.get_id() == id {
            self.resolver = resolver::start(col, this).await;
        } else if self.downloader.get_id() == id {
            self.downloader = downloader::start(col, this).await;
        } else if self.dispatcher.get_id() == id {
            self.dispatcher = dispatcher::start(col, this).await;
        } else if self.sourcer.iter().any(|cell| cell.get_id() == id) {
            take(&mut self.sourcer).into_iter().for_each(|cell| {
                cell.stop(Some("Restarting".to_owned()));
            });
            self.sourcer = sourcer::start(col, this).await;
        } else {
            warn!(actor = ?cell, "Unknown actor terminated");
        }
    }
}

impl Actor for Forrit {
    type Arguments = ();
    type Msg = Message;
    type State = Running;

    async fn pre_start(
        &self,
        this: ractor::ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        info!("Forrit starting");

        let cell = this.get_cell();

        let res = join4(
            resolver::start(&self.col, cell.clone()),
            downloader::start(&self.col, cell.clone()),
            sourcer::start(&self.col, cell.clone()),
            dispatcher::start(&self.col, cell.clone()),
        )
        .await;

        ractor::time::send_after(Duration::from_secs(3), cell, || Message::Check);

        Ok(Running {
            resolver: res.0,
            downloader: res.1,
            sourcer: res.2,
            dispatcher: res.3,
        })
    }

    async fn post_start(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        _: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        info!("Forrit started, starting API");

        Ok(())
    }

    async fn handle_supervisor_evt(
        &self,
        myself: ractor::ActorRef<Self::Msg>,
        message: ractor::SupervisionEvent,
        state: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        use SupervisionEvent::*;
        match message {
            ActorStarted(cell) => {
                info!(name=?cell.get_name(), "Actor started");
            }
            ActorTerminated(cell, _, reason) => {
                warn!(?reason, name=?cell.get_name(), "Actor terminated, restarting");
                state.restart(myself.get_cell(), cell, &self.col).await;
            }
            ActorFailed(cell, error) => {
                warn!(?error, name=?cell.get_name(), "Actor failed, restarting");
                state.restart(myself.get_cell(), cell, &self.col).await;
            }
            ProcessGroupChanged(_) => {}
        }
        Ok(())
    }
}

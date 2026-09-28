#![allow(clippy::large_enum_variant)]
#![feature(
    try_blocks,
    type_changing_struct_update,
    never_type,
    associated_type_defaults,
    result_option_map_or_default
)]

pub mod api;
pub mod config;
pub mod db;
pub mod dispatcher;
pub mod downloader;
pub mod notifier;
pub mod resolver;
pub mod search;
pub mod sourcer;
pub mod test;
pub mod util;

#[cfg(feature = "webui")]
pub mod webui;

use std::{
    collections::BTreeSet,
    mem::take,
    sync::{Arc, LazyLock},
    time::Duration,
};

use forrit_config::{Config, ConfigHandle, ConfigLayers, ConfigSnapshot};
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
    config: ConfigHandle,
}

impl Forrit {
    pub async fn new(layers: ConfigLayers) -> Result<Self, ractor::ActorProcessingErr> {
        let database = layers.database()?;
        let mongo = Client::with_uri_str(&database.url).await?;
        let db = mongo.database(&database.database);
        let col = Collections::new(&db, layers).await?;
        let config = col.config.handle();

        Ok(Self { col, config })
    }

    pub async fn run(self) -> Result<(), SpawnErr> {
        let col = self.col.clone();
        let config = self.config.clone();
        Actor::spawn(Some("supervisor".to_owned()), self, ()).await?;
        api::run(col, config).await;
        Ok(())
    }
}

#[derive(Debug)]
pub enum Message {
    Check,
    ConfigChanged,
}

pub fn reload_config() -> bool {
    ractor::registry::where_is("supervisor".to_owned())
        .is_some_and(|supervisor| supervisor.send_message(Message::ConfigChanged).is_ok())
}

#[derive(Debug, Clone)]
pub struct Running {
    resolver: ActorCell,
    downloader: ActorCell,
    sourcer: Vec<ActorCell>,
    dispatcher: ActorCell,
    config: Arc<ConfigSnapshot>,
    retiring: Vec<ActorCell>,
}

impl Running {
    fn retire(&mut self, cell: ActorCell) {
        cell.stop(Some("Applying configuration".to_owned()));
        self.retiring.push(cell);
    }

    fn is_retiring(&mut self, cell: &ActorCell) -> bool {
        let id = cell.get_id();
        let retiring = self.retiring.iter().any(|actor| actor.get_id() == id);
        self.retiring.retain(|actor| actor.get_id() != id);
        retiring
    }

    async fn reload(&mut self, this: ActorCell, col: &Collections, handle: &ConfigHandle) {
        let next = handle.snapshot();
        if next.revision() == self.config.revision() {
            return;
        }
        let previous = self.config.clone();
        let resolver = previous.config().resolver != next.config().resolver;
        let downloader = previous.config().downloader != next.config().downloader;
        let sourcer = previous.config().sourcer != next.config().sourcer;
        let dispatcher = previous.config().subscription != next.config().subscription;

        if resolver {
            self.retire(self.resolver.clone());
        }
        if downloader {
            self.retire(self.downloader.clone());
        }
        if dispatcher {
            self.retire(self.dispatcher.clone());
        }
        if sourcer {
            for cell in take(&mut self.sourcer) {
                self.retire(cell);
            }
        }
        if resolver || downloader || sourcer || dispatcher {
            sleep(Duration::from_secs(1)).await;
        }

        if resolver {
            self.resolver = resolver::start(col, this.clone(), next.config(), false).await;
        }
        if downloader {
            self.downloader = downloader::start(col, this.clone(), next.config()).await;
        }
        if dispatcher {
            self.dispatcher = dispatcher::start(col, this.clone(), next.config()).await;
        }
        if sourcer {
            let previous = enabled_sources(previous.config());
            let current = enabled_sources(next.config());
            let history = current.difference(&previous).cloned().collect();
            self.sourcer = sourcer::start(col, this, next.config(), &history).await;
        }
        self.config = next;
    }

    async fn restart(&mut self, this: ActorCell, cell: ActorCell, col: &Collections) {
        if self.is_retiring(&cell) {
            return;
        }
        let id = cell.get_id();
        let snapshot = self.config.clone();
        let config = snapshot.config();

        if self.sourcer.iter().any(|actor| actor.get_id() == id) {
            for actor in take(&mut self.sourcer) {
                if actor.get_id() != id {
                    self.retire(actor);
                }
            }
            sleep(Duration::from_secs(1)).await;
            self.sourcer = sourcer::start(col, this, config, &BTreeSet::new()).await;
        } else {
            sleep(Duration::from_secs(1)).await;
            if self.resolver.get_id() == id {
                self.resolver = resolver::start(col, this, config, false).await;
            } else if self.downloader.get_id() == id {
                self.downloader = downloader::start(col, this, config).await;
            } else if self.dispatcher.get_id() == id {
                self.dispatcher = dispatcher::start(col, this, config).await;
            } else {
                warn!(actor = ?cell, "Unknown actor terminated");
            }
        }
    }
}

fn enabled_sources(config: &Config) -> BTreeSet<String> {
    config
        .sourcer
        .iter("rss-")
        .filter_map(|(name, config)| config.enable.then_some(name))
        .collect()
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
        let config = self.config.snapshot();
        let history = enabled_sources(config.config());
        let res = join4(
            resolver::start(&self.col, cell.clone(), config.config(), true),
            downloader::start(&self.col, cell.clone(), config.config()),
            sourcer::start(&self.col, cell.clone(), config.config(), &history),
            dispatcher::start(&self.col, cell.clone(), config.config()),
        )
        .await;

        ractor::time::send_after(Duration::from_secs(3), cell, || Message::Check);

        Ok(Running {
            resolver: res.0,
            downloader: res.1,
            sourcer: res.2,
            dispatcher: res.3,
            config,
            retiring: Vec::new(),
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

    async fn handle(
        &self,
        myself: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            Message::Check => {}
            Message::ConfigChanged => {
                state.reload(myself.get_cell(), &self.col, &self.config).await;
            }
        }
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
                if !state.is_retiring(&cell) {
                    warn!(?reason, name=?cell.get_name(), "Actor terminated, restarting");
                    self.col.config.warning(format!(
                        "Actor {:?} terminated and was restarted: {:?}",
                        cell.get_name(),
                        reason,
                    ));
                    state.restart(myself.get_cell(), cell, &self.col).await;
                }
            }
            ActorFailed(cell, error) => {
                if !state.is_retiring(&cell) {
                    warn!(?error, name=?cell.get_name(), "Actor failed, restarting");
                    self.col
                        .config
                        .warning(format!("Actor {:?} failed and was restarted: {error}", cell.get_name(),));
                    state.restart(myself.get_cell(), cell, &self.col).await;
                }
            }
            ProcessGroupChanged(_) => {}
        }
        Ok(())
    }
}

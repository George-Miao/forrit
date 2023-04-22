use color_eyre::Result;
use forrit_core::{
    futures::{StreamExt, TryStreamExt},
    IntoStream,
};
use ractor::{pg, Actor, ActorCell, MessagingErr, SpawnErr};
use reqwest::Url;
use tap::Pipe;

use crate::NotifierConfig;

mod_use::mod_use![telegram];

pub async fn init(config: &[NotifierConfig]) -> Result<()> {
    config
        .iter()
        .into_stream()
        .then(spawn_one)
        .try_collect::<Vec<_>>()
        .await?
        .pipe(|cells| pg::join("notifiers".to_owned(), cells));

    Ok(())
}

async fn spawn_one(config: &NotifierConfig) -> Result<ActorCell, SpawnErr> {
    match config {
        NotifierConfig::Telegram(config) => Actor::spawn(None, Telegram::new(config.clone()), ())
            .await?
            .0
            .get_cell(),
    }
    .pipe(Ok)
}

pub fn emit(notification: Notification) -> Result<(), MessagingErr> {
    pg::get_members(&"notifiers".to_owned())
        .into_iter()
        .try_for_each(|cell| cell.send_message::<Telegram>(notification.clone()))
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Notification {
    chunks: Vec<NotificationChunk>,
}

impl Notification {
    pub fn new() -> Self {
        Self { chunks: vec![] }
    }

    pub fn with(mut self, chunk: NotificationChunk) -> Self {
        self.chunks.push(chunk);
        self
    }
}

impl Default for Notification {
    fn default() -> Self {
        Self::new()
    }
}

impl Extend<NotificationChunk> for Notification {
    fn extend<T: IntoIterator<Item = NotificationChunk>>(&mut self, iter: T) {
        self.chunks.extend(iter)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NotificationChunk {
    Paragraph {
        title: String,
        content: String,
        title_url: Option<Url>,
    },
    Plain {
        content: String,
    },
    Links(Vec<Link>),
    Code {
        language: Option<String>,
        content: String,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Link {
    pub url: Url,
    pub display: Option<String>,
}

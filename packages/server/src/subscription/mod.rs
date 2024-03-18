use camino::Utf8PathBuf;
use futures::{future::ready, TryStreamExt};
use mongodb::{
    bson::{doc, oid::ObjectId},
    Collection, Database,
};
use ractor::Actor;
use regex::Regex;
use salvo::oapi::ToSchema;
use serde::{Deserialize, Serialize};
use tracing::{debug, info};

use crate::{
    db::{CrudCall, CrudMessage, FromCrud, GetSet, WithId},
    downloader::{self, Job},
    resolver::crud_meta,
    sourcer::Entry,
    util::Boom,
};

pub fn new_entry(entry: WithId<Entry>) {
    ractor::registry::where_is(SubscriptionActor::NAME.to_owned())
        .map(|sub| sub.send_message(super::subscription::Message::NewEntry { entry }));
}

pub fn crud() -> CrudCall<Message> {
    CrudCall::new(SubscriptionActor::NAME)
}

pub async fn start(db: &Database) {
    Actor::spawn(
        Some(SubscriptionActor::NAME.to_owned()),
        SubscriptionActor::new(db.collection(SubscriptionActor::NAME)),
        (),
    )
    .await
    .boom("Failed to spawn subscription actor");
}

#[derive(Debug)]
pub enum Message {
    CrudSub(CrudMessage<Subscription>),
    NewEntry { entry: WithId<Entry> },
}

impl FromCrud for Message {
    type Item = Subscription;

    fn from_crud(crud: CrudMessage<Subscription>) -> Self {
        Self::CrudSub(crud)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct Subscription {
    #[salvo(schema(value_type = String))]
    meta_id: ObjectId,
    include: Option<String>,
    exclude: Option<String>,
    #[salvo(schema(value_type = String))]
    directory: Option<Utf8PathBuf>,
    team: Option<String>,
}

impl Subscription {
    fn want_entry(&self, entry: &Entry) -> bool {
        if let Some(include) = &self.include {
            let regex = Regex::new(include).expect("Invalid regex");
            if !regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = include, "Entry does not match include regex");
                return false;
            }
        }
        if let Some(exclude) = &self.exclude {
            let regex = Regex::new(exclude).expect("Invalid regex");
            if regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = exclude, "Entry matches exclude regex");
                return false;
            }
        }
        if let Some(team) = &self.team {
            if entry.group.as_ref() != Some(team) {
                debug!(?entry.group, want = team, "Entry does not match team");
                return false;
            }
        }
        true
    }
}

struct SubscriptionActor {
    subs: GetSet<Subscription>,
}

impl SubscriptionActor {
    pub const NAME: &'static str = "subscription";

    pub fn new(subs: Collection<Subscription>) -> Self {
        Self {
            subs: GetSet::new(subs),
        }
    }
}

impl Actor for SubscriptionActor {
    type Arguments = ();
    type Msg = Message;
    type State = ();

    async fn pre_start(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ractor::ActorProcessingErr> {
        info!("Subscription actor starting");
        Ok(())
    }

    #[tracing::instrument(skip(self), level = "debug", parent = None)] // log with message in span when level is debug
    #[tracing::instrument(skip_all)]
    async fn handle(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            Message::CrudSub(crud) => self.subs.handle_crud(crud).await.expect("db error"),
            Message::NewEntry { entry } => {
                debug!(?entry, "New entry");
                let Some(sub) = self
                    .subs
                    .get
                    .find(doc! { "meta_id": &entry.meta_id }, None)
                    .await
                    .expect("db error")
                    .try_filter(|sub| ready(sub.want_entry(&entry.inner)))
                    .try_next()
                    .await
                    .expect("db error")
                else {
                    return Ok(());
                };

                let meta = crud_meta()
                    .get(entry.meta_id)
                    .await
                    .expect("resolver resolves to a non-exist meta");

                let job = Job {
                    meta,
                    entry,
                    directory_override: sub.inner.directory,
                };

                downloader::new_job(job);
            }
        };

        Ok(())
    }
}

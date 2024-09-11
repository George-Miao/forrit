use forrit_core::model::{Download, DownloadState, Entry, EntryBase, PartialEntry, Subscription, WithId};
use futures::{future::ready, TryStreamExt};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::FindOneOptions,
};
use ractor::{Actor, ActorCell};
use regex::Regex;
use tracing::{debug, info, warn};

mod api;
pub use api::dispatcher_api;

use crate::{
    db::{impl_resource, Collections, CrudHandler, MongoResult, Storage},
    downloader::{self, DownloadIdx},
    sourcer::{BsonEntryIdx, EntryStorage},
    util::{ActorCellExt, Boom},
    ACTOR_ERR, RECV_ERR, SEND_ERR,
};

impl_resource!(Subscription, field(meta_id));

fn actor() -> ActorCell {
    ractor::registry::where_is(SubscriptionActor::NAME.to_owned()).expect(ACTOR_ERR)
}

pub async fn download_entry(id: ObjectId) -> Option<WithId<Download>> {
    actor()
        .call(|port| Message::DownloadEntry { id, port }, None)
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub fn new_entry(entry: Entry) {
    actor().send_message(Message::NewEntry { entry }).expect(SEND_ERR);
}

pub fn refresh_subscription(id: ObjectId) {
    actor()
        .send_message(Message::RefreshSubscription { id })
        .expect(SEND_ERR);
}

pub async fn start(db: &Collections) {
    Actor::spawn(
        Some(SubscriptionActor::NAME.to_owned()),
        SubscriptionActor::new(db.subscription.clone(), db.entry.clone(), db.download.clone()),
        (),
    )
    .await
    .boom("Failed to spawn subscription actor");
}

#[derive(Debug)]
pub enum Message {
    NewEntry {
        entry: Entry,
    },
    RefreshSubscription {
        id: ObjectId,
    },
    DownloadEntry {
        id: ObjectId,
        port: ractor::RpcReplyPort<Option<WithId<Download>>>,
    },
}

#[derive(Debug, Clone)]
struct SubscriptionActor {
    sub: Storage<Subscription>,
    entry: EntryStorage,
    download: Storage<Download>,
}

impl SubscriptionActor {
    pub const NAME: &'static str = "subscription";

    pub fn new(sub: Storage<Subscription>, entry: EntryStorage, job: Storage<Download>) -> Self {
        Self {
            sub,
            entry,
            download: job,
        }
    }

    fn sub_wants_entry(sub: &Subscription, entry: &EntryBase) -> bool {
        // TODO: Implement other filter
        if let Some(include) = &sub.include {
            let regex = Regex::new(include).expect("Invalid regex");
            if !regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = include, "Entry does not match include regex");
                return false;
            }
        }
        if let Some(exclude) = &sub.exclude {
            let regex = Regex::new(exclude).expect("Invalid regex");
            if regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = exclude, "Entry matches exclude regex");
                return false;
            }
        }
        if let Some(team) = &sub.team {
            if entry.group.as_ref() != Some(team) {
                debug!(?entry.group, want = team, "Entry does not match team");
                return false;
            }
        }
        true
    }

    async fn download_one(
        &self,
        entry: WithId<PartialEntry>,
        sub: Option<&WithId<Subscription>>,
    ) -> MongoResult<Option<WithId<Download>>> {
        let (subscription_id, directory_override) = sub
            .map(|sub| (Some(sub.id), sub.inner.directory.clone()))
            .unwrap_or((None, None));

        let WithId {
            id: entry_id,
            inner: entry,
        } = entry;

        let last = self
            .download
            .get
            .find_one(
                doc! { DownloadIdx::ENTRY_ID: &entry_id },
                FindOneOptions::builder().sort(doc! { "_id": -1 }).build(),
            )
            .await?;

        if let Some(last) = last
            && last.state.not_error()
        {
            return Ok(None);
        }

        let download = Download {
            meta_id: entry.meta_id,
            subscription_id,
            entry_id,
            directory_override,
            state: DownloadState::Pending,
        };

        let downloaded = self.download.insert(download.clone()).await?;

        self.entry.set_download_id(entry_id, downloaded.id).await?;

        downloader::new_download(download);

        Ok(Some(downloaded))
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

    async fn handle(
        &self,
        _: ractor::ActorRef<Self::Msg>,
        message: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ractor::ActorProcessingErr> {
        match message {
            Message::NewEntry { entry } => {
                debug!(?entry, "New entry");
                let Some(sub) = self
                    .sub
                    .get
                    .find(doc! { SubscriptionIdx::META_ID: &entry.meta_id }, None)
                    .await
                    .expect("db error")
                    .try_filter(|sub| ready(Self::sub_wants_entry(sub, &entry)))
                    .try_next()
                    .await
                    .expect("db error")
                else {
                    return Ok(());
                };

                let entry = self.entry.insert(entry.into()).await.expect("db error");

                self.download_one(entry.into(), Some(&sub)).await.expect("db error");
            }
            Message::DownloadEntry { id, port } => {
                let Some(entry) = self.entry.get(id).await.expect("db error") else {
                    return Ok(());
                };
                let res = self.download_one(entry, None).await.expect("db error");
                port.send(res).ok();
            }
            Message::RefreshSubscription { id } => {
                let Some(sub) = self.sub.get(id).await.expect("db error") else {
                    warn!(%id, "Subscription not found when refreshing subscription");
                    return Ok(());
                };

                tokio::spawn({
                    let this = self.clone();
                    async move {
                        this.entry
                            .get
                            .find(doc! { BsonEntryIdx::META_ID: id }, None)
                            .await
                            .expect("db error")
                            .try_filter(|x| ready(Self::sub_wants_entry(&sub, x)))
                            .try_for_each_concurrent(None, |entry| async {
                                this.download_one(entry, Some(&sub)).await?;
                                Ok(())
                            })
                            .await
                            .expect("db error");
                    }
                });
            }
        };

        Ok(())
    }
}

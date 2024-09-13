use forrit_core::model::{
    Download, DownloadState, Entry, EntryBase, PartialEntry, SubscribeGroups, Subscription, WithId,
};
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
    db::{Collections, CrudHandler, MongoResult, Storage},
    downloader::{self, DownloadIdx},
    resolver::MetaStorage,
    sourcer::{BsonEntryIdx, EntryStorage},
    util::{ActorCellExt, Boom},
    ACTOR_ERR, RECV_ERR, SEND_ERR,
};

fn actor() -> ActorCell {
    ractor::registry::where_is(SubscriptionActor::NAME.to_owned()).expect(ACTOR_ERR)
}

pub async fn download_entry(id: ObjectId) -> Option<WithId<Download>> {
    actor()
        .call(|port| Message::DownloadEntry { entry_id: id, port }, None)
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub fn new_entry(entry: Entry) {
    actor().send_message(Message::NewEntry { entry }).expect(SEND_ERR);
}

pub fn refresh_subscription(meta_id: ObjectId) {
    actor()
        .send_message(Message::RefreshSubscription { meta_id })
        .expect(SEND_ERR);
}

pub async fn start(db: &Collections) {
    Actor::spawn(
        Some(SubscriptionActor::NAME.to_owned()),
        SubscriptionActor::new(db.meta.clone(), db.entry.clone(), db.download.clone()),
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
        meta_id: ObjectId,
    },
    DownloadEntry {
        entry_id: ObjectId,
        port: ractor::RpcReplyPort<Option<WithId<Download>>>,
    },
}

#[derive(Debug, Clone)]
struct SubscriptionActor {
    meta: MetaStorage,
    entry: EntryStorage,
    download: Storage<Download>,
}

impl SubscriptionActor {
    pub const NAME: &'static str = "subscription";

    pub fn new(meta: MetaStorage, entry: EntryStorage, job: Storage<Download>) -> Self {
        Self {
            meta,
            entry,
            download: job,
        }
    }

    fn sub_wants_entry(sub: &Subscription, entry: &EntryBase) -> bool {
        if let SubscribeGroups::Groups(vec) = &sub.groups
            && let Some(g) = &entry.group
            && !vec.contains(g)
        {
            return false;
        };

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

        true
    }

    async fn download_one(
        &self,
        entry: WithId<PartialEntry>,
        sub: Option<&Subscription>,
    ) -> MongoResult<Option<WithId<Download>>> {
        let (subscription_id, directory_override) = sub
            .map(|sub| (entry.meta_id, sub.directory.clone()))
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
                    .meta
                    .get_by_oid(entry.meta_id)
                    .await
                    .expect("db error")
                    .and_then(|x| x.inner.subscription)
                else {
                    return Ok(());
                };

                if !Self::sub_wants_entry(&sub, &entry) {
                    return Ok(());
                }

                let entry = self.entry.insert(entry.into()).await.expect("db error");

                self.download_one(entry.into(), Some(&sub)).await.expect("db error");
            }
            Message::DownloadEntry { entry_id, port } => {
                let Some(entry) = self.entry.get(entry_id).await.expect("db error") else {
                    return Ok(());
                };
                let res = self.download_one(entry, None).await.expect("db error");
                port.send(res).ok();
            }
            Message::RefreshSubscription { meta_id } => {
                let Some(sub) = self
                    .meta
                    .get(meta_id)
                    .await
                    .expect("db error")
                    .and_then(|x| x.inner.subscription)
                else {
                    warn!(%meta_id, "Subscription not found when refreshing subscription");
                    return Ok(());
                };

                tokio::spawn({
                    let this = self.clone();

                    async move {
                        this.entry
                            .get
                            .find(doc! { BsonEntryIdx::META_ID: meta_id }, None)
                            .await
                            .expect("db error")
                            .try_filter(|entry| ready(Self::sub_wants_entry(&sub, entry)))
                            .try_filter(|entry| {
                                let get = this.download.get.clone();
                                let entry_id = entry.id;
                                async move {
                                    get.find_one(
                                        doc! {
                                            DownloadIdx::ENTRY_ID: entry_id,
                                        },
                                        None,
                                    )
                                    .await
                                    .expect("db error")
                                    .is_none()
                                }
                            })
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

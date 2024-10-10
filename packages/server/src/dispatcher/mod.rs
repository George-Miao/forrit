use forrit_core::model::{
    Download, DownloadState, Entry, EntryBase, Job, PartialEntry, SubscribeGroups, Subscription, WithId,
};
use futures::{future::ready, Stream, TryStreamExt};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::FindOneOptions,
};
use ractor::{Actor, ActorCell, ActorProcessingErr};
use regex::Regex;
use tracing::{debug, info, warn};

mod api;
pub use api::dispatcher_api;

use crate::{
    db::{Collections, CrudHandler, Storage},
    downloader::{self, JobIdx},
    resolver::MetaStorage,
    sourcer::{BsonEntryIdx, EntryStorage},
    util::{get_torrent_name, ActorCellExt, Boom},
    ACTOR_ERR, RECV_ERR, SEND_ERR,
};

fn actor() -> ActorCell {
    ractor::registry::where_is(SubscriptionActor::NAME.to_owned()).expect(ACTOR_ERR)
}

/// Manually trigger a download job for an entry
pub async fn download_entry(entry: WithId<PartialEntry>) -> WithId<Job> {
    actor()
        .call(|port| Message::DownloadEntry { entry, port }, None)
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

pub async fn start(db: &Collections, supervisor: ActorCell) -> ActorCell {
    Actor::spawn_linked(
        Some(SubscriptionActor::NAME.to_owned()),
        SubscriptionActor::new(db.meta.clone(), db.entry.clone(), db.jobs.clone()),
        (),
        supervisor,
    )
    .await
    .boom("Failed to spawn subscription actor")
    .0
    .get_cell()
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
        entry: WithId<PartialEntry>,
        port: ractor::RpcReplyPort<WithId<Job>>,
    },
}

#[derive(Debug, Clone)]
struct SubscriptionActor {
    meta: MetaStorage,
    entry: EntryStorage,
    job: Storage<Job>,
}

impl SubscriptionActor {
    pub const NAME: &'static str = "subscription";

    pub fn new(meta: MetaStorage, entry: EntryStorage, job: Storage<Job>) -> Self {
        Self { meta, entry, job }
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

    /// Find entries of a given meta_id that are subscribed. By subscribed, we
    /// mean that the entry is
    /// 1. wanted by the subscription, and
    /// 2. has not been downloaded _successfully_ before.
    async fn find_subscribed<'a>(
        &'a self,
        meta_id: ObjectId,
        sub: &'a Subscription,
    ) -> impl Stream<Item = Result<WithId<PartialEntry>, ActorProcessingErr>> + 'a {
        self.entry
            .get
            .find(doc! { BsonEntryIdx::META_ID: meta_id }, None)
            .await
            .expect("db error")
            // Only keep entries that are "wanted" by the subscription
            .try_filter(move |entry| ready(Self::sub_wants_entry(sub, entry)))
            .try_filter(|entry| {
                let entry_id = entry.id;
                let job = &self.job;
                async move {
                    // Filter out successfully downloaded entries
                    job.get
                        .find_one(
                            doc! { JobIdx::ENTRY_ID: entry_id },
                            FindOneOptions::builder().sort(doc! { "_id": -1 }).build(),
                        )
                        .await
                        .expect("db error")
                        // Check if the most recent download job of entry is successful. If it is, ignore it.
                        .filter(|x| x.state.not_error())
                        // Keep if recent job is erroneous or if there is no job
                        .is_none()
                }
            })
            .map_err(ActorProcessingErr::from)
    }

    async fn refresh_subscription(&self, meta_id: ObjectId) -> Result<(), ActorProcessingErr> {
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
        self.find_subscribed(meta_id, &sub)
            .await
            .try_for_each_concurrent(None, |entry| async {
                self.download_one(entry, Some(&sub)).await?;
                Ok(())
            })
            .await
    }

    async fn download_one(
        &self,
        entry: WithId<PartialEntry>,
        sub: Option<&Subscription>,
    ) -> Result<WithId<Job>, ActorProcessingErr> {
        let (subscription_id, directory_override) = sub
            .map(|sub| (entry.meta_id, sub.directory.clone()))
            .unwrap_or((None, None));

        let WithId {
            id: entry_id,
            inner: entry,
        } = entry;

        let name = get_torrent_name(entry.torrent.as_str()).await?;

        let download = Download {
            meta_id: entry.meta_id,
            subscription_id,
            entry_id,
            directory_override,
        };

        let job = Job {
            name,
            state: DownloadState::Pending,
            download,
        };

        let job = self.job.insert(job).await?;

        downloader::job_added(job.id);

        Ok(job)
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
            Message::DownloadEntry { entry, port } => {
                let res = self.download_one(entry, None).await.expect("db error");
                port.send(res).ok();
            }
            Message::RefreshSubscription { meta_id } => {
                tokio::spawn({
                    let this = self.clone();
                    async move { this.refresh_subscription(meta_id).await }
                });
            }
        };

        Ok(())
    }
}

use forrit_core::model::{Entry, Job, Subscription};
use futures::{future::ready, TryStreamExt};
use mongodb::bson::doc;
use ractor::Actor;
use tracing::{debug, info};

use crate::{
    db::{Collections, GetSet},
    downloader,
    util::Boom,
};

pub fn new_entry(entry: Entry) {
    ractor::registry::where_is(SubscriptionActor::NAME.to_owned())
        .map(|sub| sub.send_message(super::subscription::Message::NewEntry { entry }));
}

pub async fn start(db: &Collections) {
    Actor::spawn(
        Some(SubscriptionActor::NAME.to_owned()),
        SubscriptionActor::new(db.subscription.clone(), db.job.clone()),
        (),
    )
    .await
    .boom("Failed to spawn subscription actor");
}

#[derive(Debug)]
pub enum Message {
    NewEntry { entry: Entry },
}

struct SubscriptionActor {
    sub: GetSet<Subscription>,
    job: GetSet<Job>,
}

impl SubscriptionActor {
    pub const NAME: &'static str = "subscription";

    pub fn new(sub: GetSet<Subscription>, job: GetSet<Job>) -> Self {
        Self { sub, job }
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
                    .find(doc! { "meta_id": &entry.meta_id }, None)
                    .await
                    .expect("db error")
                    .try_filter(|sub| ready(sub.want_entry(&entry)))
                    .try_next()
                    .await
                    .expect("db error")
                else {
                    return Ok(());
                };

                let job = Job {
                    meta_id: entry.meta_id,
                    entry,
                    directory_override: sub.inner.directory,
                };

                self.job.set.insert_one(&job, None).await.expect("db error");

                downloader::new_job(job);
            }
        };

        Ok(())
    }
}

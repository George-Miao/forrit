use core::fmt;
use std::{
    default::default,
    fmt::{Debug, Display, Formatter},
    ops::{Deref, DerefMut},
};

use bangumi::{endpoints::FetchTags, rustified::errors::ClientError, Endpoint};
use forrit_core::BangumiSubscription;
use mongodb::bson::oid::ObjectId;
use ractor::{
    factory::{
        DiscardHandler, Factory, Job, JobKey, RoutingMode, WorkerBuilder, WorkerId, WorkerMessage,
    },
    Actor, Message,
};
use serde::{Deserialize, Serialize};
use tap::Pipe;

use crate::BANGUMI_CLIENT;

pub async fn validate(sub: &BangumiSubscription) -> Result<bool, ClientError> {
    sub.tags()
        .map(|x| x.0.to_owned())
        .collect::<Vec<_>>()
        .pipe(|tags| FetchTags::builder().ids(tags))
        .build()
        .exec(&*BANGUMI_CLIENT)
        .await?
        .parse()
        .is_ok()
        .pipe(Ok)
}

pub fn new_factory<TKey, TMsg, TWorker>() -> Factory<TKey, TMsg, TWorker>
where
    TKey: JobKey + Debug,
    TMsg: Message + Debug,
    TWorker: Actor<Msg = WorkerMessage<TKey, TMsg>>,
{
    #[derive(Clone, Debug)]
    struct Handler<F>(F);

    impl<TKey, TMsg, F> DiscardHandler<TKey, TMsg> for Handler<F>
    where
        TKey: JobKey,
        TMsg: Message,
        F: Clone + Fn(Job<TKey, TMsg>),
        Handler<F>: Send + Sync + 'static,
    {
        fn discard(&self, job: Job<TKey, TMsg>) {
            (self.0)(job)
        }

        fn clone_box(&self) -> Box<dyn DiscardHandler<TKey, TMsg>> {
            Box::new(self.clone())
        }
    }

    Factory {
        discard_handler: Some(
            Handler(|Job { key, msg, options }| warn!(?key, ?msg, ?options, "Job discarded"))
                .clone_box(),
        ),
        worker_count: 10,
        routing_mode: RoutingMode::Queuer,
        worker_parallel_capacity: usize::MAX,
        ..default()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Hash, Deserialize)]
pub struct Id(pub ObjectId);

impl Serialize for Id {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.0.to_hex())
    }
}

impl From<bangumi::Id> for Id {
    fn from(id: bangumi::Id) -> Self {
        ObjectId::parse_str(&id.0)
            .expect("Invalid bangumiL::ID: should be object id")
            .pipe(Self)
    }
}

impl Deref for Id {
    type Target = ObjectId;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for Id {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl Display for Id {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Hash, Serialize, Deserialize)]
pub struct WithId<T> {
    #[serde(rename(serialize = "id", deserialize = "_id"))]
    pub id: Id,
    #[serde(flatten)]
    pub inner: T,
}

impl<T> Deref for WithId<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<T> DerefMut for WithId<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

#[test]
fn test_id_serde() {
    let id = Id(ObjectId::new());

    let ser = serde_json::to_string(&id).unwrap();
    let de = serde_json::from_str::<Id>(&ser).unwrap();

    assert_eq!(id, de);
}

pub struct WorkerBuilderClosure<F, W>(F, std::marker::PhantomData<W>);

impl<F, W> WorkerBuilderClosure<F, W> {
    pub fn new(f: F) -> Self {
        Self(f, std::marker::PhantomData)
    }

    pub fn boxed(self) -> Box<dyn WorkerBuilder<W>>
    where
        W: Actor,
        F: 'static,
        Self: WorkerBuilder<W>,
    {
        Box::new(self)
    }
}

impl<F, W> WorkerBuilder<W> for WorkerBuilderClosure<F, W>
where
    F: Fn(WorkerId) -> W,
    W: Actor,
    WorkerBuilderClosure<F, W>: Send + Sync,
{
    fn build(&self, id: WorkerId) -> W {
        (self.0)(id)
    }
}

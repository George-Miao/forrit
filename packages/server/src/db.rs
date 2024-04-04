use std::{borrow::Borrow, fmt::Debug, marker::PhantomData, time::Duration};

use forrit_core::model::{Job, Record, Subscription, WithId};
use futures::{stream::StreamExt, TryStreamExt};
use mongodb::{
    bson::{self, doc, oid::ObjectId, Bson},
    options::{IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use ractor::{rpc::CallResult, RpcReplyPort};
use serde::{de::DeserializeOwned, Serialize};
use tap::Pipe;
use thiserror::Error;
use tracing::debug;

#[cfg(test)]
use crate::test::run;
use crate::{
    resolver::{AliasKV, MetaStorage},
    sourcer::EntryStorage,
    util::{MaybeReply, WithTimeout},
    ACTOR_ERR, RECV_ERR, SEND_ERR,
};

pub type MongoResult<T> = mongodb::error::Result<T>;
pub type KVCollection<K, V> = Collection<Record<K, V>>;

/// All collections in the database that we need
pub struct Collections {
    pub meta: MetaStorage,
    pub entry: EntryStorage,
    pub subscription: GetSet<Subscription>,
    pub job: GetSet<Job>,
    pub alias: AliasKV,
}

impl Collections {
    pub async fn new(db: &mongodb::Database) -> MongoResult<Self> {
        let meta = MetaStorage::new(db.collection("meta")).await?;
        let entry = EntryStorage::new(db.collection("entry")).await?;
        let subscription = GetSet::new(db.collection("subscription"));
        let job = GetSet::new(db.collection("job"));
        let alias = AliasKV::new(db.collection("alias")).await?;

        Ok(Self {
            meta,
            entry,
            subscription,
            job,
            alias,
        })
    }
}

#[derive(Debug, Clone)]
pub struct GetSet<T> {
    pub get: Collection<WithId<T>>,
    pub set: Collection<T>,
}

impl<T> GetSet<T> {
    pub fn new(col: Collection<T>) -> Self {
        Self {
            get: col.clone_with_type(),
            set: col,
        }
    }

    pub async fn handle_crud(&self, msg: CrudMessage<T>)
    where
        T: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync,
    {
        match msg {
            CrudMessage::List { callback } => {
                debug!("handling list request");
                async { self.get.find(None, None).await?.try_collect::<Vec<_>>().await?.pipe(Ok) }
                    .maybe_timeout(callback.get_timeout())
                    .await
                    .reply(callback);
            }
            CrudMessage::Create { data, callback } => {
                debug!(?data, "handling create request");
                async {
                    self.set
                        .insert_one(data, None)
                        .await?
                        .inserted_id
                        .as_object_id()
                        .expect("mongo returned non-oid type for inserted object")
                        .pipe(Ok)
                }
                .maybe_timeout(callback.get_timeout())
                .await
                .reply(callback);
            }
            CrudMessage::Read { id, callback } => {
                debug!(%id, "handling read request");
                async { self.get.find_one(doc! { "_id": id }, None).await?.pipe(Ok) }
                    .maybe_timeout(callback.get_timeout())
                    .await
                    .reply(callback);
            }
            CrudMessage::Update { id, data, callback } => {
                debug!(?data, %id, "handling update request");
                async {
                    let res = self.set.replace_one(doc! { "_id": id }, data, None).await?;
                    Ok(res.modified_count != 0)
                }
                .maybe_timeout(callback.get_timeout())
                .await
                .reply(callback);
            }
            CrudMessage::Delete { id, callback } => {
                debug!(%id, "handling delete request");
                async { self.get.find_one_and_delete(doc! { "_id": id }, None).await?.pipe(Ok) }
                    .maybe_timeout(callback.get_timeout())
                    .await
                    .reply(callback);
            }
        }
    }
}

#[derive(Debug)]
pub enum CrudMessage<T> {
    // TODO: pagination
    List {
        // cursor: Option<String>,
        // direction: Option<CursorDirections>,
        callback: RpcReplyPort<CrudResult<Vec<WithId<T>>>>,
    },
    Create {
        data: T,
        callback: RpcReplyPort<CrudResult<ObjectId>>,
    },
    Read {
        id: ObjectId,
        callback: RpcReplyPort<CrudResult<Option<WithId<T>>>>,
    },
    Update {
        id: ObjectId,
        data: T,
        callback: RpcReplyPort<CrudResult<bool>>,
    },
    Delete {
        id: ObjectId,
        callback: RpcReplyPort<CrudResult<Option<WithId<T>>>>,
    },
}

pub trait FromCrud<T>: Sized {
    const ACTOR_NAME: &'static str;
    const RESOURCE_NAME: &'static str;

    fn from_crud(msg: CrudMessage<T>) -> Self;
}

#[derive(Debug, Error)]
pub enum CrudError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] mongodb::error::Error),

    #[error("Internal service time out (limit: {limit:?})")]
    Timeout { limit: Duration },
}

pub type CrudResult<T, E = CrudError> = Result<T, E>;

pub struct CrudCall<R, M> {
    target: String,
    timeout: Option<Duration>,
    _p: PhantomData<(R, M)>,
}

impl<R, M> CrudCall<R, M> {
    pub fn new(target: impl Into<String>) -> Self {
        Self {
            target: target.into(),
            timeout: None,
            _p: PhantomData,
        }
    }

    pub fn timeout(mut self, timeout: Option<Duration>) -> Self {
        self.timeout = timeout;
        self
    }

    fn find_actor(&self) -> ractor::ActorRef<M> {
        ractor::registry::where_is(self.target.clone()).expect(ACTOR_ERR).into()
    }

    fn handle_result<T>(&self, res: CallResult<CrudResult<T>>) -> CrudResult<T> {
        match res {
            CallResult::Success(t) => t,
            CallResult::Timeout => Err(CrudError::Timeout {
                limit: self.timeout.expect("timeout should be set in case of timeout error"),
            }),
            CallResult::SenderError => panic!("{RECV_ERR}"),
        }
    }
}

impl<R, M> CrudCall<R, M>
where
    M: FromCrud<R> + ractor::Message,
{
    pub async fn list(self) -> CrudResult<Vec<WithId<R>>> {
        self.find_actor()
            .call(|callback| M::from_crud(CrudMessage::List { callback }), self.timeout)
            .await
            .expect(SEND_ERR)
            .pipe(|res| self.handle_result(res))
    }

    pub async fn create(self, data: R) -> CrudResult<ObjectId> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Create { data, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .pipe(|res| self.handle_result(res))
    }

    pub async fn get(self, id: ObjectId) -> CrudResult<Option<WithId<R>>> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Read { id, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .pipe(|res| self.handle_result(res))
    }

    pub async fn update(self, id: ObjectId, data: R) -> CrudResult<bool> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Update { id, data, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .pipe(|res| self.handle_result(res))
    }

    pub async fn delete(self, id: ObjectId) -> CrudResult<Option<WithId<R>>> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Delete { id, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .pipe(|res| self.handle_result(res))
    }
}

#[derive(Debug, Clone)]
pub struct KV<K, V>(GetSet<Record<K, V>>);

impl<K, V> KV<K, V> {
    pub async fn new(collection: KVCollection<K, V>) -> MongoResult<Self> {
        let this = Self(GetSet::new(collection));
        this.create_indexes().await?;
        Ok(this)
    }

    pub async fn create_indexes(&self) -> MongoResult<()> {
        self.0
            .set
            .create_indexes(
                [
                    IndexModel::builder()
                        .keys(doc! { "key": 1 })
                        .options(
                            IndexOptions::builder()
                                .unique(true)
                                .name("key_index".to_owned())
                                .build(),
                        )
                        .build(),
                    IndexModel::builder()
                        .keys(doc! { "value": 1 })
                        .options(IndexOptions::builder().name("value_index".to_owned()).build())
                        .build(),
                ],
                None,
            )
            .await?;
        Ok(())
    }

    pub fn col(&self) -> &KVCollection<K, V> {
        &self.0.set
    }
}

impl<K, V> KV<K, V> {
    pub async fn handle_crud(&self, msg: CrudMessage<Record<K, V>>)
    where
        Record<K, V>: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync,
    {
        self.0.handle_crud(msg).await
    }

    pub async fn upsert(&self, key: &K, value: &V) -> MongoResult<Option<ObjectId>>
    where
        K: Serialize,
        V: Serialize,
    {
        let k = bson::to_bson(key.borrow())?;
        let doc = doc! { "$set": { "value": bson::to_bson(value)? } };
        self.0
            .set
            .update_one(
                doc! { "key": k },
                UpdateModifications::Document(doc),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await
            .map(|res| res.upserted_id.as_ref().and_then(Bson::as_object_id))
    }

    pub async fn get(&self, key: &K) -> MongoResult<Option<V>>
    where
        K: Serialize + DeserializeOwned,
        V: DeserializeOwned,
        Record<K, V>: Unpin + Send + Sync,
    {
        self.0
            .get
            .find_one(doc! { "key": bson::to_bson(key.borrow())? }, None)
            .await?
            .map(|x| x.inner.value)
            .pipe(Ok)
    }

    pub async fn find_keys_by_value(&self, val: &V) -> MongoResult<Vec<K>>
    where
        K: DeserializeOwned,
        V: Serialize + DeserializeOwned,
    {
        self.col()
            .find(doc! { "value": bson::to_bson(val)? }, None)
            .await?
            .map(|res| res.map(|rec| rec.key))
            .try_collect()
            .await
    }

    pub async fn delete(&self, key: &K) -> MongoResult<bool>
    where
        K: Serialize + DeserializeOwned,
    {
        self.0
            .set
            .delete_one(doc! { "key": bson::to_bson(key)? }, None)
            .await
            .map(|res| res.deleted_count != 0)
    }
}

#[test]
fn test_kv() {
    run(|env| async move {
        let kv = KV::new(env.db.collection("alias")).await.unwrap();

        kv.upsert(&"test".to_owned(), &1).await.unwrap();
        kv.upsert(&"test".to_owned(), &1).await.unwrap();
        kv.upsert(&"test2".to_owned(), &1).await.unwrap();

        let found = kv.find_keys_by_value(&1).await.unwrap();
        assert_eq!(found, vec!["test".to_owned(), "test2".to_owned()]);
    });
}

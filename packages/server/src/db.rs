use std::{
    borrow::Borrow,
    marker::PhantomData,
    ops::{Deref, DerefMut},
    time::Duration,
};

use futures::{stream::StreamExt, TryStreamExt};
use mongodb::{
    bson::{self, doc, oid::ObjectId, Bson},
    options::{IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use ractor::RpcReplyPort;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use tap::Pipe;

#[cfg(test)]
use crate::test::run;
use crate::{ACTOR_ERR, RECV_ERR, SEND_ERR};

pub type MongoResult<T> = mongodb::error::Result<T>;
pub type KVCollection<K, V> = Collection<Record<K, V>>;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct WithId<T> {
    #[serde(rename = "_id")]
    pub id: ObjectId,
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

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Record<K, V> {
    key: K,
    value: V,
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

    pub async fn handle_crud(&self, msg: CrudMessage<T>) -> MongoResult<()>
    where
        T: Serialize + DeserializeOwned + Unpin + Send + Sync,
    {
        match msg {
            CrudMessage::List {
                // cursor,
                // direction,
                callback,
            } => {
                // let res = PaginatedCursor::new(None, cursor, direction)
                //     .find(&self.get.clone_with_type(), None)
                //     .await
                //     .expect("db error");
                let res = self.get.find(None, None).await?.try_collect::<Vec<_>>().await?;
                callback.send(res).ok();
                Ok(())
            }
            CrudMessage::Create { data, callback } => {
                let res = self.set.insert_one(data, None).await?;
                let id = res
                    .inserted_id
                    .as_object_id()
                    .expect("mongo returned non-oid type for inserted object");
                callback.send(id).ok();
                Ok(())
            }
            CrudMessage::Read { id, callback } => {
                let res = self.get.find_one(doc! { "_id": id }, None).await?;
                callback.send(res).ok();
                Ok(())
            }
            CrudMessage::Update { id, data, callback } => {
                let res = self.set.replace_one(doc! { "_id": id }, data, None).await?;
                callback.send(res.modified_count != 0).ok();
                Ok(())
            }
            CrudMessage::Delete { id, callback } => {
                let res = self.get.find_one_and_delete(doc! { "_id": id }, None).await?;
                callback.send(res).ok();
                Ok(())
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
        callback: RpcReplyPort<Vec<WithId<T>>>,
    },
    Create {
        data: T,
        callback: RpcReplyPort<ObjectId>,
    },
    Read {
        id: ObjectId,
        callback: RpcReplyPort<Option<WithId<T>>>,
    },
    Update {
        id: ObjectId,
        data: T,
        callback: RpcReplyPort<bool>,
    },
    Delete {
        id: ObjectId,
        callback: RpcReplyPort<Option<WithId<T>>>,
    },
}

pub trait FromCrud: Sized {
    type Item;
    fn from_crud(msg: CrudMessage<Self::Item>) -> Self;
}

pub struct CrudCall<M> {
    target: String,
    timeout: Option<Duration>,
    _p: PhantomData<M>,
}

impl<M> CrudCall<M> {
    pub fn new(target: impl Into<String>) -> Self {
        Self {
            target: target.into(),
            timeout: None,
            _p: PhantomData,
        }
    }

    fn find_actor(&self) -> ractor::ActorRef<M> {
        ractor::registry::where_is(self.target.clone()).expect(ACTOR_ERR).into()
    }
}

impl<M> CrudCall<M>
where
    M: FromCrud + ractor::Message,
{
    pub async fn list(self) -> Vec<WithId<M::Item>> {
        self.find_actor()
            .call(|callback| M::from_crud(CrudMessage::List { callback }), self.timeout)
            .await
            .expect(SEND_ERR)
            .expect(RECV_ERR)
    }

    pub async fn create(self, data: M::Item) -> ObjectId {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Create { data, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .expect(RECV_ERR)
    }

    pub async fn get(self, id: ObjectId) -> Option<WithId<M::Item>> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Read { id, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .expect(RECV_ERR)
    }

    pub async fn update(self, id: ObjectId, data: M::Item) -> bool {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Update { id, data, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .expect(RECV_ERR)
    }

    pub async fn delete(self, id: ObjectId) -> Option<WithId<M::Item>> {
        self.find_actor()
            .call(
                |callback| M::from_crud(CrudMessage::Delete { id, callback }),
                self.timeout,
            )
            .await
            .expect(SEND_ERR)
            .expect(RECV_ERR)
    }
}

#[derive(Debug, Clone)]
pub struct KV<K, V>(Collection<Record<K, V>>);

impl<K, V> KV<K, V> {
    pub async fn new(collection: KVCollection<K, V>) -> MongoResult<Self> {
        collection
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

        Ok(Self(collection))
    }

    pub fn col(&self) -> &KVCollection<K, V> {
        &self.0
    }
}

impl<K, V> KV<K, V> {
    pub async fn upsert(&self, key: &K, value: &V) -> MongoResult<Option<ObjectId>>
    where
        K: Serialize,
        V: Serialize,
    {
        let k = bson::to_bson(key.borrow())?;
        let doc = doc! { "$set": { "value": bson::to_bson(value)? } };
        self.0
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
            .find_one(doc! { "key": bson::to_bson(key.borrow())? }, None)
            .await?
            .map(|x| x.value)
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
            .delete_one(doc! { "key": bson::to_bson(key)? }, None)
            .await
            .map(|res| res.deleted_count != 0)
    }
}

#[test]
fn test_kv() {
    run(|env| async move {
        let kv = KV::new(env.db.collection("aliases")).await.unwrap();

        kv.upsert(&"test".to_owned(), &1).await.unwrap();
        kv.upsert(&"test".to_owned(), &1).await.unwrap();
        kv.upsert(&"test2".to_owned(), &1).await.unwrap();

        let found = kv.find_keys_by_value(&1).await.unwrap();
        assert_eq!(found, vec!["test".to_owned(), "test2".to_owned()]);
    });
}

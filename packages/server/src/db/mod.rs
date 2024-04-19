use std::{borrow::Borrow, fmt::Debug};

use forrit_core::model::{BsonMeta, CursorParam, Job, ListResult, Meta, Record, Subscription, WithId};
use mongodb::{
    bson::{self, doc, oid::ObjectId, Bson, Document},
    options::{FindOptions, IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use mongodb_cursor_pagination::Pagination;
use serde::{de::DeserializeOwned, Serialize};
use tap::Pipe;
use thiserror::Error;

#[cfg(test)]
use crate::test::run;
use crate::{
    resolver::{AliasKV, MetaStorage},
    sourcer::EntryStorage,
    util::ToCore,
};

mod_use::mod_use![crud];

pub type MongoResult<T> = mongodb::error::Result<T>;
pub type KVCollection<K, V> = Collection<Record<K, V>>;

/// All collections in the database that we need
#[derive(Debug, Clone)]
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

/// Guarantee that `Self` wraps `T` and it acts like a supertype of `T`
/// after serialization. Serialized form of `Self` **MUST** also be a valid `T`,
/// that is, it can be deserialized back to `T`.
pub(crate) trait Wrapping<T> {
    fn wrap(x: T) -> Self;
}

impl<T> Wrapping<T> for T {
    #[inline(always)]
    fn wrap(x: T) -> Self {
        x
    }
}

impl Wrapping<Meta> for BsonMeta {
    #[inline(always)]
    fn wrap(x: Meta) -> Self {
        x.into()
    }
}

#[derive(Debug, Clone)]
pub struct GetSet<R, S = R> {
    pub get: Collection<WithId<R>>,
    pub set: Collection<S>,
}

impl<R, S> GetSet<R, S>
where
    S: Wrapping<R>,
{
    pub fn new(col: Collection<S>) -> Self {
        Self {
            get: col.clone_with_type(),
            set: col,
        }
    }

    pub async fn list_by(
        &self,
        filter: impl Into<Option<Document>>,
        sort: impl Into<Option<Document>>,
        param: CursorParam,
    ) -> CrudResult<ListResult<WithId<R>>>
    where
        R: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync,
    {
        self.get
            .find_paginated::<WithId<R>>(
                filter.into(),
                FindOptions::builder()
                    .sort(sort)
                    .limit(param.per_page as i64)
                    .build()
                    .pipe(Some),
                param.into_cursor(),
            )
            .await?
            .to_core()
            .pipe(Ok)
    }
}

#[derive(Debug, Clone)]
pub struct KV<K, V>(GetSet<Record<K, V>>);

impl<K, V> CrudHandler for KV<K, V>
where
    Record<K, V>: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync + 'static,
{
    type Resource = Record<K, V>;
    type Shim = Record<K, V>;

    impl_delegate_crud!();
}

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

    #[cfg(test)]
    pub fn col(&self) -> &KVCollection<K, V> {
        &self.0.set
    }
}

impl<K, V> KV<K, V> {
    // pub async fn handle_crud(&self, msg: CrudMessage<Record<K, V>>)
    // where
    //     Record<K, V>: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync
    // + 'static, { self.0.handle_crud(msg).await
    // }

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

    #[cfg(test)]
    pub async fn find_keys_by_value(&self, val: &V) -> MongoResult<Vec<K>>
    where
        K: DeserializeOwned,
        V: Serialize + DeserializeOwned,
    {
        use futures::{stream::StreamExt, TryStreamExt};

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

#[test]
fn same_type() {
    struct A {}

    fn same_type<T>(_: T)
    where
        T: From<A> + Into<A> + 'static,
    {
        println!("{:?}", std::any::TypeId::of::<T>());
        println!("{:?}", std::any::TypeId::of::<A>());
    }

    same_type(A {})
}

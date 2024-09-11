use std::{borrow::Borrow, fmt::Debug};

use forrit_core::model::{BsonMeta, Download, ListParam, ListResult, Meta, Record, Subscription, WithId};
use mongodb::{
    bson::{self, doc, oid::ObjectId, Bson, Document},
    options::{FindOptions, IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use mongodb_cursor_pagination::{CursorError, Pagination};
use serde::{de::DeserializeOwned, Serialize};
use tap::Pipe;
use thiserror::Error;

use crate::{
    resolver::{AliasKV, MetaStorage},
    sourcer::EntryStorage,
    util::ToCore,
};

mod_use::mod_use![crud, index, kv];

pub type MongoResult<T> = mongodb::error::Result<T>;

/// All collections in the database that we need
#[derive(Debug, Clone)]
pub struct Collections {
    pub meta: MetaStorage,
    pub entry: EntryStorage,
    pub subscription: Storage<Subscription>,
    pub download: Storage<Download>,
    pub alias: AliasKV,
}

impl Collections {
    pub async fn new(db: &mongodb::Database) -> MongoResult<Self> {
        let meta = MetaStorage::new(db.collection("meta")).await?;
        let entry = EntryStorage::new(db.collection("entry")).await?;
        let subscription = Storage::new(db.collection("subscription")).await?;
        let download = Storage::new(db.collection("job")).await?;
        let alias = AliasKV::new(db.collection("alias")).await?;

        Ok(Self {
            meta,
            entry,
            subscription,
            download,
            alias,
        })
    }
}

/// Guarantee that `Self` wraps `T` and it acts like a supertype of `T`
/// after serialization. Serialized form of `Self` **MUST** also be a valid `T`,
/// that is, it can be deserialized back to `T`.
pub trait Wrapping<T> {
    fn wrap(x: T) -> Self;
    fn unwrap(self) -> T;
}

impl<T> Wrapping<T> for T {
    #[inline(always)]
    fn wrap(x: T) -> Self {
        x
    }

    #[inline(always)]
    fn unwrap(self) -> T {
        self
    }
}

impl Wrapping<Meta> for BsonMeta {
    #[inline(always)]
    fn wrap(x: Meta) -> Self {
        x.into()
    }

    #[inline(always)]
    fn unwrap(self) -> Meta {
        self.inner
    }
}

#[derive(Debug, Clone)]
pub struct Storage<R, W = R> {
    pub get: Collection<WithId<R>>,
    pub set: Collection<W>,
}

impl<R, W> Storage<R, W>
where
    W: Wrapping<R> + Resource,
{
    pub async fn new(col: Collection<W>) -> MongoResult<Self> {
        col.create_indexes(W::Idx::indexes(), None).await?;
        Ok(Self {
            get: col.clone_with_type(),
            set: col,
        })
    }

    pub async fn get_one(&self, id: ObjectId) -> MongoResult<Option<WithId<R>>>
    where
        WithId<R>: DeserializeOwned + Send + Sync + Unpin,
    {
        self.get.find_one(doc! { "_id": id }, None).await
    }

    pub async fn insert(&self, data: R) -> MongoResult<WithId<R>>
    where
        W: Serialize,
    {
        let wrapped = W::wrap(data);
        let id = self
            .set
            .insert_one(&wrapped, None)
            .await?
            .inserted_id
            .as_object_id()
            .expect(NON_OID);
        Ok(WithId {
            id,
            inner: wrapped.unwrap(),
        })
    }

    pub async fn list_by(
        &self,
        filter: impl Into<Option<Document>>,
        param: ListParam,
    ) -> CrudResult<ListResult<WithId<R>>>
    where
        R: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync,
    {
        self.get
            .find_paginated(
                filter.into(),
                FindOptions::builder()
                    .sort(W::Idx::SORT_INDEX.map(|x| doc! { x: -1 }))
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

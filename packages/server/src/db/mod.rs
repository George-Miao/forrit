use std::{
    borrow::Borrow,
    convert::Infallible,
    fmt::{Debug, Display},
};

use forrit_config::ConfigLayers;
use forrit_core::model::{Job, ListParam, ListResult, Record, WithId};
use mongodb::{
    Collection, IndexModel,
    bson::{self, Bson, Document, doc, oid::ObjectId},
    options::IndexOptions,
};
use serde::{Serialize, de::DeserializeOwned};
use tap::Pipe;
use thiserror::Error;

use crate::{
    config::{ConfigError, ConfigStore},
    downloader::JobIdx,
    resolver::MetaStorage,
    search::{AliasStorage, Search},
    sourcer::EntryStorage,
};

mod_use::mod_use![crud, index, kv, migration];
mod pagination;
pub use pagination::PaginationError;

pub type MongoResult<T> = mongodb::error::Result<T>;

#[derive(Debug, Error)]
pub enum InitError {
    #[error("Database initialization failed: {0}")]
    Database(#[from] mongodb::error::Error),

    #[error("Database serialization failed: {0}")]
    Serialization(#[from] bson::error::Error),

    #[error("Cannot materialize search fields for {collection} record {id}: {reason}")]
    SearchMaterial {
        collection: &'static str,
        id: ObjectId,
        reason: String,
    },

    #[error("Cannot decode {collection} record {id:?} while materializing search fields: {source}")]
    SearchDecode {
        collection: &'static str,
        id: Bson,
        source: bson::error::Error,
    },
    #[error(transparent)]
    Config(#[from] ConfigError),
}

pub type InitResult<T> = Result<T, InitError>;

/// All collections in the database that we need
#[derive(Debug, Clone)]
pub struct Collections {
    pub migration: KV<String, String>,
    pub meta: MetaStorage,
    pub entry: EntryStorage,
    pub jobs: Storage<Job>,
    pub alias: AliasStorage,
    pub search: Search,
    pub config: ConfigStore,
}

impl Collections {
    pub async fn new(db: &mongodb::Database, layers: ConfigLayers) -> InitResult<Self> {
        let migration = KV::new(db.collection("migration")).await?;
        let meta = MetaStorage::new(db.collection("meta")).await?;
        let entry = EntryStorage::new(db.collection("entry")).await?;
        let jobs = Storage::new(db.collection("job")).await?;
        let alias = AliasStorage::new(db.collection("alias")).await?;
        let search = Search::new(meta.get.clone(), entry.get.clone(), alias.get.clone());
        let config = ConfigStore::new(db, layers).await?;

        let this = Self {
            migration,
            meta,
            entry,
            jobs,
            alias,
            search,
            config,
        };
        this.migrate().await?;
        this.search.ensure_indexes().await?;
        Ok(this)
    }

    async fn migrate(&self) -> InitResult<()> {
        tracing::info!("Starting database migration");
        self.run_one_migration(AddTorrentInfoToEntry).await?;
        self.run_one_migration(SanitizeEntryDescriptions).await?;
        self.run_one_migration(SearchMaterial).await?;
        tracing::info!("Database migration completed");

        Ok(())
    }

    async fn run_one_migration<M: Migration>(&self, m: M) -> InitResult<()> {
        let curr = self.migration.get(&"version".into()).await?.unwrap_or_default();
        let migrate = m.version();
        if curr.as_str() >= &*migrate {
            return Ok(());
        }
        let description = m.description();
        tracing::info!("Running migration {}: {}", migrate, description);
        m.run(self).await?;
        self.migration.upsert(&"version".into(), &migrate.into_owned()).await?;
        tracing::info!("Migration {} completed", m.version());
        Ok(())
    }
}

/// Guarantee that `Self` wraps `T` and it acts like a supertype of `T`
/// after serialization. Serialized form of `Self` **MUST** also be a valid `T`,
/// that is, it can be deserialized back to `T`.
pub trait Wrapping<T> {
    type Error: Display;

    fn try_wrap(x: T) -> Result<Self, Self::Error>
    where
        Self: Sized;
    fn unwrap(self) -> T;
}

impl<T> Wrapping<T> for T {
    type Error = Infallible;

    #[inline(always)]
    fn try_wrap(x: T) -> Result<Self, Self::Error> {
        Ok(x)
    }

    #[inline(always)]
    fn unwrap(self) -> T {
        self
    }
}

#[derive(Debug, Clone)]
pub struct Storage<R: Send + Sync, W: Send + Sync = R> {
    pub get: Collection<WithId<R>>,
    pub set: Collection<W>,
}

impl<R, W> Storage<R, W>
where
    R: Send + Sync,
    W: Wrapping<R> + Resource + Send + Sync,
{
    pub async fn new(col: Collection<W>) -> MongoResult<Self> {
        col.create_indexes(W::Idx::indexes()).await?;
        Ok(Self {
            get: col.clone_with_type(),
            set: col,
        })
    }

    pub async fn get_one(&self, id: ObjectId) -> MongoResult<Option<WithId<R>>>
    where
        WithId<R>: DeserializeOwned + Send + Sync + Unpin,
    {
        self.get.find_one(doc! { "_id": id }).await
    }

    pub async fn get_by_name(&self, name: &str) -> MongoResult<Option<WithId<R>>>
    where
        WithId<R>: DeserializeOwned + Send + Sync + Unpin,
    {
        self.get.find_one(doc! { JobIdx::NAME: name }).await
    }

    pub async fn insert(&self, data: R) -> CrudResult<WithId<R>>
    where
        W: Serialize,
    {
        let wrapped = W::try_wrap(data).map_err(|error| CrudError::InvalidResource(error.to_string()))?;
        let id = self
            .set
            .insert_one(&wrapped)
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
        pagination::find_paginated(&self.get, filter.into().unwrap_or_default(), W::Idx::SORT_INDEX, param)
            .await
            .map_err(Into::into)
    }
}

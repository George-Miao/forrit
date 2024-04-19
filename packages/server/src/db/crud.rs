use std::fmt::Debug;

use forrit_core::model::{ListResult, UpdateResult, WithId};
use mongodb::bson::{doc, oid::ObjectId};
use serde::{de::DeserializeOwned, Serialize};
use tap::Pipe;

use crate::db::*;

macro_rules! impl_delegate_crud {
    ($($index:expr)?) => {
        async fn list(
            &self,
            param: forrit_core::model::ListParam,
        ) -> crate::db::CrudResult<forrit_core::model::ListResult<WithId<Self::Resource>>> {
            #[allow(unused_mut, unused_assignments)]
            let mut sort = None;
            $(sort = Some(mongodb::bson::doc! { $index: -1 });)?
            self.0.list_by(None, sort, param).await
        }

        async fn create(&self, data: Self::Resource) -> crate::db::CrudResult<ObjectId> {
            <GetSet<_, _> as CrudHandler>::create(&self.0, data).await
        }

        async fn get(&self, id: ObjectId) -> crate::db::CrudResult<Option<WithId<Self::Resource>>> {
            <GetSet<_, _> as CrudHandler>::get(&self.0, id).await
        }

        async fn update(
            &self,
            id: ObjectId,
            data: Self::Resource,
        ) -> crate::db::CrudResult<forrit_core::model::UpdateResult> {
            <GetSet<_, _> as CrudHandler>::update(&self.0, id, data).await
        }

        async fn delete(&self, id: ObjectId) -> crate::db::CrudResult<Option<WithId<Self::Resource>>> {
            <GetSet<_, _> as CrudHandler>::delete(&self.0, id).await
        }
    };
}

pub(crate) use impl_delegate_crud;

#[derive(Debug, Error)]
pub enum CrudError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] mongodb::error::Error),

    #[error("Pagination error: {0}")]
    CursorError(#[from] mongodb_cursor_pagination::CursorError),
}

pub type CrudResult<T, E = CrudError> = Result<T, E>;

pub(crate) trait CrudHandler {
    type Resource;
    type Shim: Wrapping<Self::Resource>;

    async fn list(&self, param: ListParam) -> CrudResult<ListResult<WithId<Self::Resource>>>;
    async fn create(&self, data: Self::Resource) -> CrudResult<ObjectId>;
    async fn get(&self, id: ObjectId) -> CrudResult<Option<WithId<Self::Resource>>>;
    async fn update(&self, id: ObjectId, data: Self::Resource) -> CrudResult<UpdateResult>;
    async fn delete(&self, id: ObjectId) -> CrudResult<Option<WithId<Self::Resource>>>;
}

impl<G, S> CrudHandler for GetSet<G, S>
where
    S: Wrapping<G>,
    G: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync + 'static,
    S: Debug + Serialize + DeserializeOwned + Unpin + Send + Sync + 'static,
{
    type Resource = G;
    type Shim = S;

    async fn list(&self, param: ListParam) -> CrudResult<ListResult<WithId<Self::Resource>>> {
        self.list_by(None, None, param).await
    }

    async fn create(&self, data: Self::Resource) -> CrudResult<ObjectId> {
        self.set
            .insert_one(S::wrap(data), None)
            .await?
            .inserted_id
            .as_object_id()
            .expect("mongo returned non-oid type for inserted object")
            .pipe(Ok)
    }

    async fn get(&self, id: ObjectId) -> CrudResult<Option<WithId<Self::Resource>>> {
        self.get.find_one(doc! { "_id": id }, None).await?.pipe(Ok)
    }

    async fn update(&self, id: ObjectId, data: Self::Resource) -> CrudResult<UpdateResult> {
        let res = self.set.replace_one(doc! { "_id": id }, S::wrap(data), None).await?;
        Ok(UpdateResult {
            updated: res.modified_count != 0,
        })
    }

    async fn delete(&self, id: ObjectId) -> CrudResult<Option<WithId<Self::Resource>>> {
        self.get.find_one_and_delete(doc! { "_id": id }, None).await?.pipe(Ok)
    }
}

use forrit_core::model::{BsonMeta, Meta, WithId};
use futures::{StreamExt, TryStreamExt};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::{FindOneOptions, IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use tap::Pipe;

use crate::db::{CrudMessage, GetSet, MongoResult};

#[derive(Clone, Debug)]
pub struct MetaStorage(GetSet<BsonMeta>);

impl MetaStorage {
    pub const BEGIN_INDEX: &'static str = "begin";
    pub const TITLE_INDEX: &'static str = "title";
    pub const TMDB_ID_INDEX: &'static str = "tv.id";

    pub async fn new(col: Collection<BsonMeta>) -> MongoResult<Self> {
        let this = Self(GetSet::new(col));
        this.create_indexes().await?;
        Ok(this)
    }

    pub async fn create_indexes(&self) -> MongoResult<()> {
        self.0
            .set
            .create_indexes(
                [
                    IndexModel::builder()
                        .keys(doc! { Self::TITLE_INDEX: 1 })
                        .options(IndexOptions::builder().name("title_index".to_owned()).build())
                        .build(),
                    IndexModel::builder()
                        .keys(doc! { Self::TMDB_ID_INDEX: 1 })
                        .options(IndexOptions::builder().name("tmdb_id_index".to_owned()).build())
                        .build(),
                    IndexModel::builder()
                        .keys(doc! { Self::BEGIN_INDEX: 1 })
                        .options(IndexOptions::builder().name("begin_index".to_owned()).build())
                        .build(),
                    IndexModel::builder()
                        .keys(doc! {
                            "title": "text",
                            "title_translate.zh-Hans": "text",
                            "title_translate.zh-Hant": "text",
                            "title_translate.en": "text",
                            "title_translate.ja": "text",
                            "tv.name": "text",
                            "tv.original_name": "text",
                        })
                        .options(IndexOptions::builder().name("text_search_index".to_owned()).build())
                        .build(),
                ],
                None,
            )
            .await?;
        Ok(())
    }

    pub async fn handle_crud(&self, msg: CrudMessage<Meta>) {
        self.0.handle_crud(msg).await
    }

    pub async fn text_search(&self, query: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(doc! { "$text": { "$search": query } }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_latest(&self, tmdb_id: u64) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(
                doc! { Self::TMDB_ID_INDEX: tmdb_id as u32 },
                FindOneOptions::builder().sort(doc! { Self::BEGIN_INDEX: -1 }).build(),
            )
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_title(&self, title: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(doc! { Self::TITLE_INDEX: title }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_oid(&self, oid: ObjectId) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(doc! { "_id": oid }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_tmdb_id(&self, id: u64) -> MongoResult<Vec<WithId<Meta>>> {
        self.0
            .get
            .find(doc! { Self::TMDB_ID_INDEX: id as u32 }, None)
            .await?
            .map(|x| x.map(WithId::into))
            .try_collect::<Vec<_>>()
            .await
    }

    pub async fn upsert(&self, meta: &Meta) -> MongoResult<()> {
        let doc = mongodb::bson::to_document(&meta).expect("Failed to convert Meta to bson Document");
        self.0
            .set
            .update_one(
                doc! { Self::TITLE_INDEX: &meta.title },
                UpdateModifications::Document(doc! { "$set": doc }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await?;
        Ok(())
    }
}

#[test]
fn test_meta() {
    crate::test::run(|env| async move {
        let m = env.col.meta.get_by_title("異種族レビュアーズ").await.unwrap().unwrap();
        println!("{:?}", m);
        env.col.meta.upsert(&m).await.unwrap();
    })
}

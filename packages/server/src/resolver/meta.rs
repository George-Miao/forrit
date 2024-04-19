use forrit_core::{
    date::YearSeason,
    model::{BsonMeta, Meta, WithId},
};
use futures::{StreamExt, TryStreamExt};
use mongodb::{
    bson::{self, doc, oid::ObjectId},
    options::{FindOneOptions, IndexOptions, UpdateModifications, UpdateOptions},
    Collection, IndexModel,
};
use tap::Pipe;

use crate::db::{impl_delegate_crud, CrudHandler, GetSet, MongoResult};

#[derive(Debug, Clone)]
pub struct MetaStorage(GetSet<Meta, BsonMeta>);

impl CrudHandler for MetaStorage {
    type Resource = Meta;
    type Shim = BsonMeta;

    impl_delegate_crud!();
}

impl MetaStorage {
    pub const BEGIN_INDEX: &'static str = "bson_begin";
    pub const END_INDEX: &'static str = "bson_end";
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

    pub async fn text_search(&self, query: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(doc! { "$text": { "$search": query } }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_season(&self, season: YearSeason) -> MongoResult<Vec<WithId<Meta>>> {
        let season_begin = bson::DateTime::from(season.begin());
        let season_end = bson::DateTime::from(season.end());
        let before_season = doc! { "$lt": season_begin };
        let after_season = doc! { "$gte": season_begin };
        let within_season = doc! { "$gte": &season_begin,"$lt": &season_end,};

        self.0
            .get
            .find(
                doc! {
                  "$or": [
                    { Self::BEGIN_INDEX: &within_season },
                    { Self::BEGIN_INDEX: &before_season, Self::END_INDEX: &after_season },
                  ],
                },
                None,
            )
            .await?
            .map(|x| Ok(x?.into()))
            .try_collect::<Vec<_>>()
            .await
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

    // pub async fn get_by_tmdb_id(&self, id: u64) -> MongoResult<Vec<WithId<Meta>>>
    // {     self.0
    //         .get
    //         .find(doc! { Self::TMDB_ID_INDEX: id as u32 }, None)
    //         .await?
    //         .map(|x| x.map(WithId::into))
    //         .try_collect::<Vec<_>>()
    //         .await
    // }

    pub async fn upsert(&self, meta: &BsonMeta) -> MongoResult<()> {
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

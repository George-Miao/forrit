use forrit_core::{
    date::YearSeason,
    model::{BsonMeta, Meta, WithId},
};
use futures::{StreamExt, TryStreamExt};
use mongodb::{
    bson::{self, doc, oid::ObjectId},
    options::{FindOneOptions, IndexOptions, UpdateModifications, UpdateOptions},
    IndexModel,
};
use tap::Pipe;

use crate::db::{impl_resource, MongoResult, Storage};

pub type MetaStorage = Storage<Meta, BsonMeta>;

impl_resource!(
    BsonMeta,
    sort_by bson_begin,
    field(bson_end, tv_id, title),
    index(
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
            .build()
    )
);

impl MetaStorage {
    pub async fn text_search(&self, query: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.get
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
        let within_season = doc! { "$gte": &season_begin, "$lt": &season_end,};

        let filter = doc! {
          "$or": [
            { BsonMetaIdx::BSON_BEGIN : &within_season },
            { BsonMetaIdx::BSON_BEGIN : &before_season, BsonMetaIdx::BSON_END:
        &after_season },   ],
        };

        self.get
            .find(filter, None)
            .await?
            .map(|x| Ok(x?.into()))
            .try_collect::<Vec<_>>()
            .await
    }

    pub async fn get_latest(&self, tmdb_id: u64) -> MongoResult<Option<WithId<Meta>>> {
        self.get
            .find_one(
                doc! { BsonMetaIdx::TV_ID: tmdb_id as i64 },
                FindOneOptions::builder()
                    .sort(doc! { BsonMetaIdx::BSON_BEGIN: -1 })
                    .build(),
            )
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_title(&self, title: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.get
            .find_one(doc! { BsonMetaIdx::TITLE: title }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    pub async fn get_by_oid(&self, oid: ObjectId) -> MongoResult<Option<WithId<Meta>>> {
        self.get
            .find_one(doc! { "_id": oid }, None)
            .await?
            .map(WithId::into)
            .pipe(Ok)
    }

    // pub async fn get_by_tmdb_id(&self, id: u64) -> MongoResult<Vec<WithId<Meta>>>
    // {     self
    //         .get
    //         .find(doc! { Self::TMDB_ID_INDEX: id as u32 }, None)
    //         .await?
    //         .map(|x| x.map(WithId::into))
    //         .try_collect::<Vec<_>>()
    //         .await
    // }

    pub async fn upsert(&self, meta: &BsonMeta) -> MongoResult<()> {
        let doc = mongodb::bson::to_document(&meta).expect("Failed to convert Meta to bson Document");
        self.set
            .update_one(
                doc! { BsonMetaIdx::TITLE: &meta.title },
                UpdateModifications::Document(doc! { "$set": doc }),
                UpdateOptions::builder().upsert(true).build(),
            )
            .await?;
        Ok(())
    }
}

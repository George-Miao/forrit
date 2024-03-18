use std::collections::BTreeMap;

use bangumi_data::{Broadcast, Item, ItemType, Language, Site};
use futures::{StreamExt, TryStreamExt};
use mongodb::{
    bson::{self, doc},
    options::{FindOneOptions, FindOptions, IndexOptions, UpdateModifications, UpdateOptions},
    ClientSession, Collection, IndexModel,
};
use serde::{Deserialize, Serialize};
use tap::Pipe;
use tmdb_api::tvshow::{SeasonShort, TVShowShort};

use crate::db::{CrudMessage, GetSet, MongoResult, WithId};

/// Metadata of a bangumi season
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Meta {
    pub title: String,
    pub title_translate: BTreeMap<Language, Vec<String>>,
    #[serde(rename = "type")]
    pub item_type: ItemType,
    pub lang: Language,
    pub official_site: String,
    pub sites: Vec<Site>,
    pub broadcast: Option<Broadcast>,
    pub comment: Option<String>,
    pub begin: Option<bson::DateTime>,
    pub end: Option<bson::DateTime>,
    pub tv: Option<TVShowShort>,
    pub season: Option<SeasonShort>,
    pub season_override: Option<SeasonOverride>,
}

impl Meta {
    pub fn new(item: Item, tv: Option<TVShowShort>, season: Option<SeasonShort>) -> Self {
        Self {
            title: item.title,
            title_translate: item.title_translate,
            item_type: item.item_type,
            lang: item.lang,
            official_site: item.official_site,
            sites: item.sites,
            broadcast: item.broadcast,
            comment: item.comment,
            begin: item.begin.map(crate::util::iso8601_to_bson),
            end: item.end.map(crate::util::iso8601_to_bson),
            tv,
            season,
            season_override: None,
        }
    }

    pub fn original_title(&self) -> Option<&str> {
        self.title_translate
            .get(&self.lang)
            .and_then(|x| x.get(0))
            .map(String::as_str)
    }

    pub fn season_number(&self) -> Option<u64> {
        self.season_override
            .as_ref()
            .map(|x| x.number)
            .or_else(|| self.season.as_ref().map(|s| s.inner.season_number))
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SeasonOverride {
    pub name: String,
    pub number: u64,
}

#[derive(Clone, Debug)]
pub struct MetaStorage(GetSet<Meta>);

impl MetaStorage {
    pub const BEGIN_INDEX: &'static str = "begin";
    pub const TITLE_INDEX: &'static str = "title";
    pub const TMDB_ID_INDEX: &'static str = "tv.id";

    pub fn new(col: Collection<Meta>) -> Self {
        Self(GetSet::new(col))
    }

    pub async fn handle_crud(&self, msg: CrudMessage<Meta>) -> MongoResult<()> {
        self.0.handle_crud(msg).await
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
        self.0.get.find_one(doc! { "$text": { "$search": query } }, None).await
    }

    pub async fn get_latest(&self, tmdb_id: u64) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_one(
                doc! { Self::TMDB_ID_INDEX: tmdb_id as u32 },
                FindOneOptions::builder().sort(doc! { Self::BEGIN_INDEX: -1 }).build(),
            )
            .await
    }

    pub async fn get(&self, title: &str) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find(
                doc! { Self::TITLE_INDEX: title },
                FindOptions::builder().limit(1).build(),
            )
            .await?
            .next()
            .await
            .transpose()?
            .pipe(Ok)
    }

    pub async fn get_by_oid(&self, oid: bson::oid::ObjectId) -> MongoResult<Option<WithId<Meta>>> {
        self.0.get.find_one(doc! { "_id": oid }, None).await
    }

    pub async fn get_by_id(&self, id: u64) -> MongoResult<Vec<WithId<Meta>>> {
        self.0
            .get
            .find(doc! { Self::TMDB_ID_INDEX: id as u32 }, None)
            .await?
            .try_collect::<Vec<_>>()
            .await
    }

    pub async fn get_with_session(
        &self,
        title: &str,
        session: &mut ClientSession,
    ) -> MongoResult<Option<WithId<Meta>>> {
        self.0
            .get
            .find_with_session(
                doc! { Self::TITLE_INDEX: title },
                FindOptions::builder().limit(1).build(),
                session,
            )
            .await?
            .next(session)
            .await
            .transpose()?
            .pipe(Ok)
    }

    pub async fn upsert(&self, meta: Meta) -> MongoResult<()> {
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

use super::*;

pub type KV<K, V> = Storage<Record<K, V>>;

pub struct RecordIdx;

impl Idx for RecordIdx {
    const SORT_INDEX: Option<&'static str> = None;

    fn indexes() -> impl IntoIterator<Item = IndexModel> {
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
        ]
    }
}

impl<K, V> Resource for Record<K, V> {
    type Idx = RecordIdx;
}

impl<K, V> Storage<Record<K, V>> {
    pub async fn upsert(&self, key: &K, value: &V) -> MongoResult<Option<ObjectId>>
    where
        K: Serialize,
        V: Serialize,
    {
        let k = bson::to_bson(key.borrow())?;
        let doc = doc! { "$set": { "value": bson::to_bson(value)? } };
        self.set
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
        self.get
            .find_one(doc! { "key": bson::to_bson(key.borrow())? }, None)
            .await?
            .map(|x| x.inner.value)
            .pipe(Ok)
    }

    pub async fn list_keys_by_value(&self, val: &V, param: ListParam) -> CrudResult<ListResult<WithId<Record<K, V>>>>
    where
        K: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync + 'static,
        V: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync + 'static,
    {
        let value = bson::to_bson(val).map_err(|e| CrudError::CursorError(CursorError::BsonSerError(e)))?;
        self.list_by(doc! { "value": value }, param).await
    }

    pub async fn delete(&self, key: &K) -> MongoResult<bool>
    where
        K: Serialize + DeserializeOwned,
    {
        self.set
            .delete_one(doc! { "key": bson::to_bson(key)? }, None)
            .await
            .map(|res| res.deleted_count != 0)
    }
}

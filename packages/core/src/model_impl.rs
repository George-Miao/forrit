use std::{
    any::{type_name, TypeId},
    mem::ManuallyDrop,
    ops::{Deref, DerefMut},
};

use bangumi_data::{Item, Language};
use camino::{Utf8Path, Utf8PathBuf};
use salvo_oapi::{schema, Components, Object, Ref, RefOr, Schema, SchemaFormat, SchemaType, ToSchema};
use tmdb_api::tvshow::{SeasonShort, TVShowShort};
use ts_rs::TS;

use crate::model::*;

#[cfg(feature = "mongodb_pagination")]
impl ListParam {
    pub fn into_cursor(self) -> Option<mongodb_cursor_pagination::DirectedCursor> {
        Some(match self.direction {
            Direction::Forward => mongodb_cursor_pagination::DirectedCursor::Forward(self.cursor?),
            Direction::Backwards => mongodb_cursor_pagination::DirectedCursor::Backwards(self.cursor?),
        })
    }
}

impl<K, V> ToSchema for Record<K, V> {
    fn to_schema(components: &mut Components) -> RefOr<schema::Schema> {
        let typename = type_name::<Record<K, V>>().replace("::", ".");
        let schema = schema::Object::new()
            .property("key", String::to_schema(components))
            .property("value", String::to_schema(components))
            .required("key")
            .required("value");
        let ret = RefOr::Ref(Ref::new(format!("#/components/schemas/{}", typename)));
        components.schemas.insert(typename, schema.into());
        ret
    }
}

impl<T> ListResult<T> {
    pub fn len(&self) -> usize {
        self.items.len()
    }

    pub fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    pub fn convert<P>(self, conv: impl Fn(T) -> P) -> ListResult<P>
    where
        T: 'static,
        P: 'static,
    {
        if TypeId::of::<P>() == TypeId::of::<T>() {
            let mut old = ManuallyDrop::new(self.items);
            // Safety: P and T are the same type, and the old Vec is leaked
            let items = unsafe { Vec::from_raw_parts(old.as_mut_ptr().cast(), old.len(), old.capacity()) };
            ListResult {
                total_count: self.total_count,
                page_info: self.page_info,
                items,
            }
        } else {
            ListResult {
                total_count: self.total_count,
                page_info: self.page_info,
                items: self.items.into_iter().map(conv).collect(),
            }
        }
    }
}
impl<T: ToSchema> ToSchema for ListResult<T> {
    fn to_schema(components: &mut salvo_oapi::oapi::Components) -> RefOr<schema::Schema> {
        let schema = Object::new()
            .property("total_count", Object::new().schema_type(SchemaType::Number))
            .required("total_count")
            .property(
                "page_info",
                schema::AllOf::new().item(<PageInfo as ToSchema>::to_schema(components)),
            )
            .required("page_info")
            .property("items", schema::Array::new(T::to_schema(components)))
            .required("items");
        components
            .schemas
            .insert(std::any::type_name::<ListResult<T>>().replace("::", "."), schema.into());
        RefOr::Ref(Ref::new(format!(
            "#/components/schemas/{}",
            std::any::type_name::<ListResult<T>>().replace("::", ".")
        )))
    }
}

impl<T> WithId<T> {
    pub fn into<P>(self) -> WithId<P>
    where
        P: From<T>,
    {
        WithId {
            id: self.id,
            inner: self.inner.into(),
        }
    }

    pub fn map<P>(self, f: impl FnOnce(T) -> P) -> WithId<P> {
        WithId {
            id: self.id,
            inner: f(self.inner),
        }
    }
}

impl<T> WithId<Option<T>> {
    pub fn transpose(self) -> Option<WithId<T>> {
        self.inner.map(|inner| WithId { id: self.id, inner })
    }
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
// Recursive expansion of TS macro
// ================================

impl<T> ::ts_rs::TS for WithId<T>
where
    T: ::ts_rs::TS,
{
    type WithoutGenerics = WithId<::ts_rs::Dummy>;

    fn ident() -> String {
        "WithId".to_owned()
    }

    fn name() -> String {
        format!("WithId<{}>", <T as ::ts_rs::TS>::name())
    }

    fn decl_concrete() -> String {
        format!("type WithId = {};", Self::inline())
    }

    fn decl() -> String {
        #[derive(Copy, Clone, Debug, Hash, Eq, PartialEq, Ord, PartialOrd)]
        struct T;

        impl std::fmt::Display for T {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{:?}", self)
            }
        }
        impl TS for T {
            type WithoutGenerics = T;

            fn name() -> String {
                stringify!(T).to_owned()
            }

            fn inline() -> String {
                panic!("{} cannot be inlined", Self::name())
            }

            fn inline_flattened() -> String {
                panic!("{} cannot be flattened", Self::name())
            }

            fn decl() -> String {
                panic!("{} cannot be declared", Self::name())
            }

            fn decl_concrete() -> String {
                panic!("{} cannot be declared", Self::name())
            }
        }
        let inline = <WithId<T> as ::ts_rs::TS>::inline();
        format!("type WithId<T> = {inline};")
    }

    fn inline() -> String {
        format!(
            "{{ _id: {} }} & {}",
            <OidExtJson as ::ts_rs::TS>::name(),
            <T as ::ts_rs::TS>::name()
        )
        .replace(" } & { ", " ")
    }

    fn inline_flattened() -> String {
        Self::inline()
    }

    #[allow(clippy::unused_unit)]
    fn generics() -> impl ::ts_rs::typelist::TypeList
    where
        Self: 'static,
    {
        use ::ts_rs::typelist::TypeList;
        ().push::<T>().extend(<T as ::ts_rs::TS>::generics())
    }

    fn output_path() -> Option<&'static std::path::Path> {
        Some(std::path::Path::new("WithId.ts"))
    }

    #[allow(clippy::unused_unit)]
    fn dependency_types() -> impl ::ts_rs::typelist::TypeList
    where
        Self: 'static,
    {
        {
            use ::ts_rs::typelist::TypeList;
            ().push::<OidExtJson>()
                .extend(<OidExtJson as ::ts_rs::TS>::generics())
                .push::<T>()
                .extend(<T as ::ts_rs::TS>::generics())
        }
    }
}

#[cfg(test)]
#[test]
fn export_bindings_with_id() {
    <WithId<()> as ::ts_rs::TS>::export_all().expect("could not export type");
}

impl<T: ToSchema + 'static> ToSchema for WithId<T> {
    fn to_schema(components: &mut Components) -> RefOr<schema::Schema> {
        let typename = type_name::<WithId<T>>().replace("::", ".");
        let schema = schema::AllOf::new()
            .item(if TypeId::of::<T>() == TypeId::of::<Self>() {
                RefOr::Ref(schema::Ref::new("#"))
            } else {
                T::to_schema(components)
            })
            .item(
                Object::new()
                    .property("_id", <ObjectIdSchema as ToSchema>::to_schema(components))
                    .required("_id"),
            );
        let ret = RefOr::Ref(Ref::new(format!("#/components/schemas/{}", typename)));
        components.schemas.insert(typename, schema.into());
        ret
    }
}

impl ToSchema for ObjectIdSchema {
    fn to_schema(components: &mut Components) -> RefOr<schema::Schema> {
        components.schemas.entry("ObjectId".to_owned()).or_insert_with(|| {
            RefOr::T(Schema::Object(
                Object::new()
                    .property("$oid", Ref::from_schema_name("ObjectIdString"))
                    .required("$oid"),
            ))
        });
        RefOr::Ref(schema::Ref::from_schema_name("ObjectId"))
    }
}

impl ToSchema for ObjectIdStringSchema {
    fn to_schema(components: &mut Components) -> RefOr<schema::Schema> {
        components
            .schemas
            .entry("ObjectIdString".to_owned())
            .or_insert_with(|| {
                RefOr::T(Schema::Object(
                    Object::new()
                        .schema_type(SchemaType::String)
                        .format(SchemaFormat::Custom("ObjectId".to_owned()))
                        .pattern("^[0-9a-fA-F]{24}$"),
                ))
            });
        RefOr::Ref(schema::Ref::from_schema_name("ObjectIdString"))
    }
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
            begin: item.begin.map(crate::util::iso8601_to_chrono),
            end: item.end.map(crate::util::iso8601_to_chrono),
            tv,
            season,
            season_override: None,
        }
    }

    pub fn original_title(&self) -> Option<&str> {
        self.title_translate
            .get(&self.lang)
            .and_then(|titles| titles.first())
            .map(String::as_str)
    }

    pub fn proper_title(&self) -> &str {
        self.title_translate
            .get(&Language::ZhHans)
            .or_else(|| self.title_translate.get(&Language::ZhHant))
            .or_else(|| self.title_translate.get(&Language::Ja))
            .and_then(|titles| titles.first())
            .unwrap_or(&self.title)
            .as_str()
    }

    pub fn into_proper_title(mut self) -> String {
        self.title_translate
            .remove(&Language::ZhHans)
            .or_else(|| self.title_translate.remove(&Language::ZhHant))
            .or_else(|| self.title_translate.remove(&Language::Ja))
            .and_then(|mut titles| {
                if titles.is_empty() {
                    None
                } else {
                    Some(titles.swap_remove(0))
                }
            })
            .unwrap_or(self.title)
    }

    pub fn season_number(&self) -> Option<u64> {
        self.season_override
            .as_ref()
            .map(|x| x.number)
            .or_else(|| self.season.as_ref().map(|s| s.inner.season_number))
    }
}

impl Deref for BsonMeta {
    type Target = Meta;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl DerefMut for BsonMeta {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl From<Meta> for BsonMeta {
    fn from(meta: Meta) -> Self {
        Self {
            bson_begin: meta.begin.map(bson::DateTime::from_chrono),
            bson_end: meta.end.map(bson::DateTime::from_chrono),
            tv_id: meta.tv.as_ref().map(|tv| tv.inner.id),
            inner: meta,
        }
    }
}

impl From<BsonMeta> for Meta {
    fn from(meta: BsonMeta) -> Self {
        meta.inner
    }
}

impl From<PartialEntry> for BsonEntry {
    fn from(meta: PartialEntry) -> Self {
        Self {
            bson_pub_date: meta.base.pub_date.map(bson::DateTime::from_chrono),
            inner: meta,
        }
    }
}

impl From<BsonEntry> for PartialEntry {
    fn from(meta: BsonEntry) -> Self {
        meta.inner
    }
}

impl From<Entry> for PartialEntry {
    fn from(entry: Entry) -> Self {
        Self {
            base: entry.base,
            meta_title: Some(entry.meta_title),
            meta_id: Some(entry.meta_id),
        }
    }
}

impl Deref for BsonEntry {
    type Target = PartialEntry;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl Deref for Entry {
    type Target = EntryBase;

    fn deref(&self) -> &Self::Target {
        &self.base
    }
}

impl Deref for PartialEntry {
    type Target = EntryBase;

    fn deref(&self) -> &Self::Target {
        &self.base
    }
}

impl PartialEntry {
    pub fn into_entry(self) -> Option<Entry> {
        Some(Entry {
            base: self.base,
            meta_title: self.meta_title?,
            meta_id: self.meta_id?,
        })
    }
}
impl Download {
    pub fn get_path(&self, meta: &WithId<Meta>, savepath: impl AsRef<Utf8Path>) -> Utf8PathBuf {
        let name = self
            .directory_override
            .as_ref()
            .map(|path| path.as_str())
            .or_else(|| meta.tv.as_ref().map(|tv| tv.inner.original_name.as_str()))
            .or_else(|| meta.original_title())
            .unwrap_or(&meta.title);
        let season = meta.inner.season_number().unwrap_or(1);
        savepath.as_ref().join(name).join(format!("S{season}"))
    }
}

impl DownloadState {
    pub fn not_error(&self) -> bool {
        match self {
            Self::Pending | Self::Downloading | Self::Finished => true,
            Self::Failed => false,
        }
    }
}

impl IndexStat {
    pub fn new(arg: IndexArg) -> Self {
        Self {
            arg,
            ..Default::default()
        }
    }
}

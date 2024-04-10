use std::{
    any::{type_name, TypeId},
    ops::{Deref, DerefMut},
};

use bangumi_data::Item;
use camino::{Utf8Path, Utf8PathBuf};
use regex::Regex;
use salvo_oapi::{schema, Components, Object, Ref, RefOr, Schema, SchemaFormat, SchemaType, ToSchema};
use tmdb_api::tvshow::{SeasonShort, TVShowShort};
use tracing::debug;
use ts_rs::TS;

use crate::model::*;
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
                    .schema_type(SchemaType::String)
                    .format(SchemaFormat::Custom("ObjectId".to_owned()))
                    .pattern("^[0-9a-fA-F]{24}$"),
            ))
        });
        RefOr::Ref(schema::Ref::from_schema_name("ObjectId"))
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
            bson_begin: item.begin.map(crate::util::iso8601_to_bson),
            bson_end: item.end.map(crate::util::iso8601_to_bson),
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

    pub fn season_number(&self) -> Option<u64> {
        self.season_override
            .as_ref()
            .map(|x| x.number)
            .or_else(|| self.season.as_ref().map(|s| s.inner.season_number))
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
            meta_id: self.meta_id?,
        })
    }
}
impl Job {
    pub fn path(&self, meta: &WithId<Meta>, savepath: impl AsRef<Utf8Path>) -> Utf8PathBuf {
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

impl Subscription {
    pub fn want_entry(&self, entry: &Entry) -> bool {
        if let Some(include) = &self.include {
            let regex = Regex::new(include).expect("Invalid regex");
            if !regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = include, "Entry does not match include regex");
                return false;
            }
        }
        if let Some(exclude) = &self.exclude {
            let regex = Regex::new(exclude).expect("Invalid regex");
            if regex.is_match(&entry.title) {
                debug!(?entry.title, pattern = exclude, "Entry matches exclude regex");
                return false;
            }
        }
        if let Some(team) = &self.team {
            if entry.group.as_ref() != Some(team) {
                debug!(?entry.group, want = team, "Entry does not match team");
                return false;
            }
        }
        true
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

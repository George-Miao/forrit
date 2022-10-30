use rustify_derive::Endpoint;
use typed_builder::TypedBuilder;

use crate::{Bangumi, Current, SearchResult, Tag, TagType, Torrent, Torrents, WithId};

#[derive(Debug, Copy, Clone, Endpoint, TypedBuilder)]
#[endpoint(path = "/api/tag/fetch", method = "POST", response = "WithId<Tag>")]
pub struct FetchTag<'a> {
    #[serde(rename = "_id")]
    #[endpoint(body)]
    id: &'a str,
}

#[derive(Debug, Clone, Endpoint, TypedBuilder)]
#[endpoint(
    path = "/api/tag/fetch",
    method = "POST",
    response = "Vec<WithId<Tag>>"
)]
pub struct FetchTags {
    #[serde(rename = "_ids")]
    #[endpoint(body)]
    #[builder(setter(into))]
    ids: Vec<String>,
}

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(
    path = "/api/tag/search",
    method = "POST",
    response = "SearchResult<Vec<WithId<Tag>>>"
)]
#[builder(doc)]
pub struct SearchTags<'a> {
    #[endpoint(body)]
    name: &'a str,

    #[serde(default)]
    #[endpoint(body)]
    #[builder(default = true)]
    keywords: bool,

    #[endpoint(body)]
    #[serde(default)]
    #[builder(default = true, setter(skip))]
    multi: bool,

    #[endpoint(body)]
    #[serde(default, rename = "type")]
    #[builder(default, setter(strip_option))]
    tag_type: Option<TagType>,
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/api/tag/popbangumi",
    method = "GET",
    response = "Vec<WithId<Tag>>"
)]
pub struct GetPopularBangumi;

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/api/tag/common",
    method = "GET",
    response = "Vec<WithId<Tag>>"
)]
pub struct GetCommonTags;

#[derive(Debug, Clone, Endpoint)]
#[endpoint(path = "/api/tag/misc", method = "GET", response = "Vec<WithId<Tag>>")]
pub struct GetMiscTags;

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(
    path = "/api/tag/suggest",
    method = "POST",
    response = "Vec<WithId<Tag>>"
)]
#[builder(doc)]
pub struct GetSuggestTags {
    #[endpoint(body)]
    query: String,
}

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(
    path = "/api/bangumi/fetch",
    method = "POST",
    response = "WithId<Bangumi>"
)]
#[builder(doc)]
pub struct FetchBangumi<'a> {
    #[serde(rename = "_id")]
    #[endpoint(body)]
    id: &'a str,
}

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(
    path = "/api/bangumi/fetch",
    method = "POST",
    response = "WithId<Bangumi>"
)]
#[builder(doc)]
pub struct FetchBangumis {
    #[serde(rename = "_id")]
    #[endpoint(body)]
    #[builder(setter(into))]
    id: Vec<String>,
}

#[derive(Debug, Clone, Endpoint)]
#[endpoint(
    path = "/api/bangumi/current",
    method = "GET",
    response = "Vec<WithId<Bangumi>>"
)]
pub struct GetCurrent;

#[derive(Debug, Clone, Endpoint)]
#[endpoint(path = "/api/v2/bangumi/current", method = "GET", response = "Current")]
pub struct GetCurrentV2;

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(
    path = "/api/torrent/search",
    method = "POST",
    response = "Vec<Torrent>"
)]
#[builder(doc)]
pub struct SearchTorrent<'a> {
    #[endpoint(body)]
    tag_id: &'a str,
}

#[derive(Debug, Clone, TypedBuilder, Endpoint)]
#[endpoint(path = "/api/torrent/search", method = "POST", response = "Torrents")]
#[builder(doc)]
pub struct SearchTorrents {
    #[serde(rename = "tag_id")]
    #[endpoint(body)]
    #[builder(setter(into))]
    tags: Vec<String>,
}

api_test!(search_tags_abc, SearchTags::builder().name("abc").tag_type(TagType::Bangumi).build() , a => {
    a.unwrap();
});

api_test!(fetch_tag, FetchTag::builder().id("632762c52eaf6e578875f7c6").build() , tag => {
    use std::ops::Deref;

    assert_eq!(tag.id.deref(), "632762c52eaf6e578875f7c6");
    assert_eq!(tag.name, "BLEACH 千年血戰篇");
});

api_test!(fetch_tags, FetchTags::builder().ids(vec!["632762c52eaf6e578875f7c6".into()]).build() , tags => {
    use std::ops::Deref;

    assert_eq!(tags.len(), 1);
    assert_eq!(tags[0].id.deref(), "632762c52eaf6e578875f7c6");
    assert_eq!(tags[0].name, "BLEACH 千年血戰篇");
});

api_test!(search_tags, SearchTags::builder().name("BLEACH").build() , tags => {
    use std::ops::Deref;
    let tags = tags.unwrap();

    assert!(!tags.is_empty());
    assert_eq!(tags[0].id.deref(), "632762c52eaf6e578875f7c6");
    assert_eq!(tags[0].name, "BLEACH 千年血戰篇");
});

api_test!(fetch_bangumi, FetchBangumi::builder().id("548f047ff892774b140ac653").build() , bangumi => {
    use std::ops::Deref;

    assert_eq!(bangumi.id.deref(), "548f047ff892774b140ac653");
    assert_eq!(bangumi.name, "結城友奈は勇者である");
});

api_test!(current, GetCurrent, bangumis => {
    assert!(!bangumis.is_empty());

});

api_test!(current_v2, GetCurrentV2, current => {
    assert!(!current.bangumis.is_empty());
});

api_test!(search_torrent, SearchTorrent::builder().tag_id("632762cc2eaf6e578875f7de").build() , _a => {});

api_test!(search_torrents, SearchTorrents::builder().tags(vec!["632762cc2eaf6e578875f7de".into()]).build() , _a => {});

macro_rules! api_test {
    ($func:ident, $req:expr, $ret:ident => $eval:expr) => {
        paste::paste! {
            #[cfg(test)]
            #[tokio::test]
            async fn [< test_ $func >]() {
                use rustify::Endpoint;
                use tap::TapFallible;

                let client = rustify::Client::default(crate::DEFAULT_DOMAIN);
                let req = $req;
                let $ret = req.exec(&client).await
                    .tap_err(|e| eprintln!("{e}"))
                    .unwrap()
                    .parse()
                    .tap_err(|e| eprintln!("{e}"))
                    .unwrap();
                $eval
            }
        }
    };
}

use api_test;

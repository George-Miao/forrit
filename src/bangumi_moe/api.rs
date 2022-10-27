use crate::bangumi_moe::{Bangumi, Current, SearchResult, Tag, WithId};

macro_rules! api {
    ($name:ident($path:expr) :: $method:ident ($( $param:ident($realarg:literal): $ty:ty, )+ $($param_default:literal = $val:expr $(,)?)*) -> $ret:ty) => {
            impl $crate::bangumi_moe::Api {
                pub async fn $name(&self, $( $param: impl Into<$ty> + Sync )*) -> ::color_eyre::Result<$ret> {
                    self.$method($path)
                    .json(&::serde_json::json!({
                        $($realarg: $param.into(),)*
                        $($param_default: $val,)*
                    }))
                    .send()
                        .await?
                        .error_for_status()?
                        .json()
                        .await
                        .map_err(Into::into)
                }
            }

    };

    ($name:ident($path:expr) :: $method:ident () -> $ret:ty) => {
        impl $crate::bangumi_moe::Api {
            pub async fn $name(&self) -> ::color_eyre::Result<$ret> {
                self.$method($path)
                    .send()
                    .await?
                    .error_for_status()?
                    .json()
                    .await
                    .map_err(Into::into)
            }
        }

        api!(@test $name() => result => { ::tracing::info!(?result); });

    };

    (@test $name:ident($( $val:expr $(,)? )*) => $ret:ident => $block:block ) => {
        paste::paste! {
            #[::tokio::test]
            async fn [< test_api_ $name >]() -> ::color_eyre::Result<()> {
                let api = $crate::bangumi_moe::Api::new();
                let $ret = api.[< $name >]($( $val ),*).await?;
                $block
                Ok(())
            }
        }
    };

    (@test $name:ident($( $val:expr $(,)? )*)) => {
        api!(@test $name($( $val:expr $(,)? )*) => _ => {});
    }
}

api!(fetch_tag("tag/fetch")         :: post (tag("_id"): &str, ) -> WithId<Tag>);
api!(search_tag_multi("tag/search") :: post (name("name"): &str, "keywords" = true, "multi" = true) -> SearchResult<Vec<Tag>>);
api!(search_tag("tag/search")       :: post (name("name"): &str, "keywords" = true) -> SearchResult<Tag>);
api!(current_v1("bangumi/current")  :: get () -> Vec<Bangumi>);
api!(current_v2("bangumi/current")  :: get_v2 () -> Current);

api!(@test fetch_tag("632762c52eaf6e578875f7c6") => tag => {
    use std::ops::Deref;

    assert_eq!(tag.id.deref(), "632762c52eaf6e578875f7c6");
    assert_eq!(tag.name, "BLEACH 千年血戰篇");
});
api!(@test search_tag_multi("BLEACH") => result => {
    match result {
        SearchResult::Found(tags) => {
            assert!(tags.iter().any(|tag| tag.name == "BLEACH 千年血戰篇"));
        }
        SearchResult::None => {
            panic!("search_tag_multi failed");
        }
    }
});

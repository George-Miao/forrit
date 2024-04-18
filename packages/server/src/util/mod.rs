use std::{collections::BTreeMap, fmt::Display, process::exit};

use either::Either;
use ractor::RpcReplyPort;
use tap::Pipe;
use tracing::{debug, error};

mod_use::mod_use![string, tmdb, time];

pub trait ToCore {
    type Core;
    fn to_core(self) -> Self::Core;
}

impl ToCore for mongodb_cursor_pagination::DirectedCursor {
    type Core = forrit_core::model::DirectedCursor;

    fn to_core(self) -> Self::Core {
        match self {
            mongodb_cursor_pagination::DirectedCursor::Backwards(edge) => {
                forrit_core::model::DirectedCursor::Backwards(edge.to_string())
            }
            mongodb_cursor_pagination::DirectedCursor::Forward(edge) => {
                forrit_core::model::DirectedCursor::Forward(edge.to_string())
            }
        }
    }
}

impl ToCore for mongodb_cursor_pagination::PageInfo {
    type Core = forrit_core::model::PageInfo;

    fn to_core(self) -> Self::Core {
        forrit_core::model::PageInfo {
            has_previous_page: self.has_previous_page,
            has_next_page: self.has_next_page,
            start_cursor: self.start_cursor.map(|c| c.to_core()),
            end_cursor: self.end_cursor.map(|c| c.to_core()),
        }
    }
}

impl<T> ToCore for mongodb_cursor_pagination::FindResult<T> {
    type Core = forrit_core::model::ListResult<T>;

    fn to_core(self) -> Self::Core {
        forrit_core::model::ListResult {
            total_count: self.total_count,
            page_info: self.page_info.to_core(),
            items: self.items,
        }
    }
}

pub trait MaybeReply {
    type Item;
    fn reply(self, callback: RpcReplyPort<Self::Item>);
}

impl<T, E: Display> MaybeReply for Result<T, E> {
    type Item = T;

    fn reply(self, callback: RpcReplyPort<Self::Item>) {
        match self {
            Ok(t) => {
                callback.send(t).ok();
            }
            Err(error) => {
                debug!(%error, "Cancel reply");
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde:: Deserialize)]
#[serde(untagged)]
pub enum MapOrVec<T> {
    Map(BTreeMap<String, T>),
    Vec(Vec<T>),
}

impl<T> MapOrVec<T> {
    pub fn is_empty(&self) -> bool {
        match self {
            MapOrVec::Map(map) => map.is_empty(),
            MapOrVec::Vec(vec) => vec.is_empty(),
        }
    }

    pub fn iter(&self) -> impl Iterator<Item = (String, &T)> {
        match self {
            MapOrVec::Map(map) => map.iter().map(|(k, v)| (k.to_owned(), v)).pipe(Either::Left),
            MapOrVec::Vec(vec) => vec
                .iter()
                .enumerate()
                .map(|(i, v)| (i.to_string(), v))
                .pipe(Either::Right),
        }
    }
}

impl<T> Default for MapOrVec<T> {
    fn default() -> Self {
        MapOrVec::Vec(Vec::new())
    }
}

pub trait Boom {
    type Output;
    fn boom(self, msg: &str) -> Self::Output;
}

impl<T> Boom for Option<T> {
    type Output = T;

    fn boom(self, msg: &str) -> T {
        self.unwrap_or_else(|| {
            error!("{}", msg);
            exit(1)
        })
    }
}

impl<T, E: Display> Boom for Result<T, E> {
    type Output = T;

    fn boom(self, msg: &str) -> T {
        self.unwrap_or_else(|error| {
            error!(%error, "{}", msg);
            exit(1)
        })
    }
}

use std::{collections::BTreeMap, fmt::Display, process::exit};

use either::Either;
use ractor::RpcReplyPort;
use tap::Pipe;
use tracing::{debug, error};

mod_use::mod_use![string, tmdb, time];

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

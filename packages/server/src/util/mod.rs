use std::{fmt::Display, process::exit};

use ractor::RpcReplyPort;
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

use std::{fmt::Display, process::exit, time::Duration};

use backon::ExponentialBuilder;
use tracing::error;

mod_use::mod_use![string, tmdb, time, actor, torrent];

pub const fn retry_backoff() -> ExponentialBuilder {
    ExponentialBuilder::new()
        .with_jitter()
        .with_min_delay(Duration::from_secs(1))
        .with_max_delay(Duration::from_secs(8))
        .with_max_times(3)
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

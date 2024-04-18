use std::time::{Duration, SystemTime};

use futures::Future;
use tap::Pipe;
use tokio::time::{timeout, Timeout};

use crate::db::CrudError;

pub fn timestamp(sec: u64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs(sec)
}

pub trait WithTimeout: Sized + Future {
    fn timeout(self, dur: Duration) -> Timeout<Self> {
        timeout(dur, self)
    }

    async fn maybe_timeout(self, dur: Option<Duration>) -> Result<<Self as Future>::Output, CrudError> {
        if let Some(dur) = dur {
            self.timeout(dur + Duration::from_secs(1))
                .await
                .map_err(|_| CrudError::Timeout { limit: dur }) // Wait for 1 additional second
        } else {
            self.await.pipe(Ok)
        }
    }
}

impl<F: Future> WithTimeout for F {}

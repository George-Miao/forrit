use std::time::{Duration, SystemTime};

use chrono::{Datelike, NaiveDate, Weekday};
use futures::Future;
use salvo::oapi::ToSchema;
use serde::{Deserialize, Serialize};
use tap::Pipe;
use tokio::time::{error::Elapsed, timeout, Timeout};

pub fn timestamp(sec: u64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs(sec)
}

pub trait WithTimeout: Sized + Future {
    fn timeout(self, dur: Duration) -> Timeout<Self> {
        timeout(dur, self)
    }

    async fn maybe_timeout(self, dur: Option<Duration>) -> Result<<Self as Future>::Output, Elapsed> {
        if let Some(dur) = dur {
            self.timeout(dur + Duration::from_secs(1)).await // Wait for 1 additional second
        } else {
            self.await.pipe(Ok)
        }
    }
}

impl<F: Future> WithTimeout for F {}

pub trait DateExt {
    fn year(&self) -> i32 {
        self.yearmonth().year
    }

    fn month(&self) -> u8 {
        self.yearmonth().month
    }

    fn yearmonth(&self) -> YearMonth;
}

impl DateExt for iso8601::Date {
    fn yearmonth(&self) -> YearMonth {
        match *self {
            Self::YMD { year, month, .. } => YearMonth::new(year, month as _),
            Self::Week { year, ww, d } => {
                chrono::NaiveDate::from_isoywd_opt(year, ww, Weekday::try_from(d as u8).expect("Invalid day of week"))
                    .expect("Invalid ISO week date")
                    .into()
            }
            Self::Ordinal { year, ddd } => NaiveDate::from_yo_opt(year, ddd).expect("Invalid ordinal date").into(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct YearMonth {
    #[salvo(schema(example = 2024))]
    pub year: i32,

    #[salvo(schema(maximum = 12, minimum = 1, example = 3))]
    pub month: u8,
}

impl From<NaiveDate> for YearMonth {
    fn from(date: NaiveDate) -> Self {
        Self {
            year: date.year(),
            month: date.month() as _,
        }
    }
}

impl YearMonth {
    pub fn new(year: i32, month: u8) -> Self {
        Self { year, month }
    }
}

impl PartialOrd for YearMonth {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for YearMonth {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.year.cmp(&other.year).then_with(|| self.month.cmp(&other.month))
    }
}

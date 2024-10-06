use chrono::{DateTime, Datelike, NaiveDate, TimeZone, Utc, Weekday};
use salvo_oapi::{ToParameters, ToSchema};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[ts(export)]
pub struct YearMonth {
    pub year: i32,

    #[salvo(schema(maximum = 12, minimum = 1))]
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
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema, ToParameters, TS)]
#[salvo(parameters(default_parameter_in = Query))]
#[ts(export)]
pub struct YearSeason {
    year: i32,
    season: Season,
}

impl Default for YearSeason {
    fn default() -> Self {
        Self::current()
    }
}

impl YearSeason {
    pub fn new(year: i32, season: Season) -> Self {
        Self { year, season }
    }

    pub fn current() -> Self {
        let now = Utc::now();
        let year = now.year();
        let month = now.month0();
        let season = Season::from_month(month as _).expect("Invalid month");
        Self { year, season }
    }

    pub fn next(&self) -> Self {
        let (season, next_year) = self.season.next();
        let year = if next_year { self.year + 1 } else { self.year };
        Self { year, season }
    }

    pub fn season_num(&self) -> u8 {
        self.season as _
    }

    /// Inclusive begin date time
    pub fn begin(&self) -> DateTime<Utc> {
        Utc.from_utc_datetime(&self.season.begin(self.year).and_hms_opt(0, 0, 0).expect("Invalid date"))
    }

    /// Exclusive end date time
    pub fn end(&self) -> DateTime<Utc> {
        self.next().begin()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema, TS)]
#[serde(rename_all = "lowercase")]
pub enum Season {
    // January new bangumi (一月新番)
    Winter = 1,
    // April new bangumi (四月新番)
    Spring = 2,
    // July new bangumi (七月新番)
    Summer = 3,
    // October new bangumi (十月新番)
    Fall   = 4,
}

impl Season {
    fn next(&self) -> (Self, bool) {
        match self {
            Self::Winter => (Self::Spring, false),
            Self::Spring => (Self::Summer, false),
            Self::Summer => (Self::Fall, false),
            Self::Fall => (Self::Winter, true),
        }
    }

    fn from_month(month0: u8) -> Option<Self> {
        match month0 {
            0..=2 => Some(Self::Winter),
            3..=5 => Some(Self::Spring),
            6..=8 => Some(Self::Summer),
            9..=11 => Some(Self::Fall),
            _ => None,
        }
    }

    /// Inclusive begin date
    pub fn begin(&self, year: i32) -> NaiveDate {
        match self {
            Self::Winter => NaiveDate::from_ymd_opt(year, 1, 1),
            Self::Spring => NaiveDate::from_ymd_opt(year, 4, 1),
            Self::Summer => NaiveDate::from_ymd_opt(year, 7, 1),
            Self::Fall => NaiveDate::from_ymd_opt(year, 10, 1),
        }
        .expect("Invalid year")
    }
}

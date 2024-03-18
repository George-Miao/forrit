use chrono::{Datelike, NaiveDate, Weekday};
use mongodb::bson;

pub fn iso8601_to_bson(datetime: iso8601::DateTime) -> bson::DateTime {
    let chrono = datetime.into_fixed_offset().expect("Invalid ISO8601 datetime");
    bson::DateTime::from_chrono(chrono)
}

pub trait DateExt {
    fn year(&self) -> i32 {
        self.yearmonth().year
    }
    fn month(&self) -> u32 {
        self.yearmonth().month
    }
    fn yearmonth(&self) -> YearMonth;
}

impl DateExt for iso8601::Date {
    fn yearmonth(&self) -> YearMonth {
        match *self {
            Self::YMD { year, month, .. } => YearMonth::new(year, month),
            Self::Week { year, ww, d } => {
                chrono::NaiveDate::from_isoywd_opt(year, ww, Weekday::try_from(d as u8).expect("Invalid day of week"))
                    .expect("Invalid ISO week date")
                    .into()
            }
            Self::Ordinal { year, ddd } => NaiveDate::from_yo_opt(year, ddd).expect("Invalid ordinal date").into(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct YearMonth {
    pub year: i32,
    pub month: u32,
}

impl From<NaiveDate> for YearMonth {
    fn from(date: NaiveDate) -> Self {
        Self {
            year: date.year(),
            month: date.month(),
        }
    }
}

impl YearMonth {
    pub fn new(year: i32, month: u32) -> Self {
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

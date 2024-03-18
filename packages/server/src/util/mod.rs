use std::{
    borrow::Cow,
    fmt::Display,
    process::exit,
    sync::LazyLock,
    time::{Duration, SystemTime},
};

use regex::Regex;
use tracing::error;

use crate::config::RenameFormat;

mod_use::mod_use![string, tmdb, time];

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

pub fn timestamp(sec: u64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs(sec)
}

pub fn normalize_title<'a>(title: &'a str, format: &RenameFormat) -> Cow<'a, str> {
    macro_rules! rule {
        ($reg:literal) => {
            ::regex::Regex::new($reg).expect("Regex should compile")
        };
    }
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            rule!(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#),
            rule!(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#),
        ]
    });

    PATTERNS
        .iter()
        .find_map(|pat| {
            pat.captures(title).and_then(|cap| {
                let pre = cap.get(1)?.as_str().trim();
                let episode = cap.get(2)?.as_str().trim();
                let suf = cap.get(3)?.as_str().trim();

                let ret = match format {
                    RenameFormat::Full => format!("{pre} E{episode} {suf}").into(),
                    RenameFormat::Short => format!("E{episode}").into(),
                };
                Some(ret)
            })
        })
        .unwrap_or_else(|| title.into())
}

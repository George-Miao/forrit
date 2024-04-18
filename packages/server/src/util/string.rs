use std::{borrow::Cow, sync::LazyLock};

use forrit_config::RenameFormat;
use regex::Regex;

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
            let cap = pat.captures(title)?;
            let pre = cap.get(1)?.as_str().trim();
            let episode = cap.get(2)?.as_str().trim();
            let suf = cap.get(3)?.as_str().trim();

            let ret = match format {
                RenameFormat::Full => format!("{pre} E{episode} {suf}").into(),
                RenameFormat::Short => format!("E{episode}").into(),
                _ => todo!(),
            };
            Some(ret)
        })
        .unwrap_or_else(|| title.into())
}

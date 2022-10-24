use std::{
    borrow::Cow,
    // fmt::Debug,
    // ops::{Deref, DerefMut},
    sync::LazyLock,
};

use regex::Regex;
// use serde::{Deserialize, Serialize};

// #[derive(Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize,
// Deserialize)] pub struct WithOId<T> {
//     #[serde(rename = "_id")]
//     pub id: ObjectId,
//     #[serde(flatten)]
//     pub data: T,
// }

// impl<T> Deref for WithOId<T> {
//     type Target = T;

//     fn deref(&self) -> &Self::Target {
//         &self.data
//     }
// }

// impl<T> DerefMut for WithOId<T> {
//     fn deref_mut(&mut self) -> &mut Self::Target {
//         &mut self.data
//     }
// }

// impl<T> WithOId<T> {
//     pub fn unwrap(self) -> T {
//         self.data
//     }
// }

pub fn normalize_title(title: &str) -> Cow<'_, str> {
    const EXPECT_ERR: &str = "Regex should compile";
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            Regex::new(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#)
                .expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#)
                .expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#)
                .expect(EXPECT_ERR),
        ]
    });

    PATTERNS
        .iter()
        .find_map(|pat| {
            pat.captures(title).and_then(|cap| {
                let pre = cap.get(1)?.as_str().trim();
                let episode = cap.get(2)?.as_str().trim();
                let suf = cap.get(3)?.as_str().trim();

                Some(format!("{pre} E{episode} {suf}").into())
            })
        })
        .unwrap_or_else(|| title.into())
}

#[test]
fn test_normalize_title() {
    macro_rules! eq {
        ($lhs:literal = $rhs:literal) => {
            assert_eq!(normalize_title($lhs), $rhs);
        };
    }
    eq!(
        "[愛戀字幕社&波子汽水漢化組][10月新番][四人各有小秘密][4-nin wa Sorezore Uso wo \
         Tsuku][01][1080P][MP4][BIG5][繁中]" =
            "[愛戀字幕社&波子汽水漢化組][10月新番][四人各有小秘密][4-nin wa Sorezore Uso wo \
             Tsuku] E01 [1080P][MP4][BIG5][繁中]"
    );
    eq!(
        "[jibaketa]Kanojo, Okarishimasu - 06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv" =
            "[jibaketa]Kanojo, Okarishimasu E06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv"
    );
}

#![feature(lazy_cell)]
#![feature(iter_intersperse)]

use std::{borrow::Cow, sync::LazyLock};

pub use futures;
use futures::{stream, Stream};

mod_use::mod_use![model, error,];

pub use bangumi;
use regex::Regex;
pub use typetag;

#[doc(hidden)]
pub mod __reexport {
    pub use paste;
    pub use serde;
}

pub trait IntoStream {
    type Item;
    type Stream: Stream<Item = Self::Item>;

    fn into_stream(self) -> Self::Stream;
}

impl<T, I> IntoStream for I
where
    I: IntoIterator<Item = T>,
{
    type Item = T;
    type Stream = futures::stream::Iter<I::IntoIter>;

    fn into_stream(self) -> Self::Stream {
        stream::iter(self)
    }
}

pub fn normalize_title(title: &str) -> Cow<'_, str> {
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

                Some(format!("{pre} E{episode} {suf}").into())
            })
        })
        .unwrap_or_else(|| title.into())
}

with! {
    pub struct WithId {
        id, content
    }
}

#[macro_export]
macro_rules! with {
    (@inline $key_name:ident = $key_val:expr, $val:expr) => {{
        $crate::__reexport::paste::paste! {
            #[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash, serde::Serialize, serde::Deserialize)]
            #[allow(non_camel_case_types)]
            struct [<With_ $key_name>]<K, T> {
                $key_name: K,
                #[serde(flatten)]
                content: T,
            }

            #[allow(clippy::redundant_field_names)]
            [<With_ $key_name>] {
                $key_name: $key_val,
                content: $val,
            }
        }
    }};

    ($key_name:ident = $key_val:expr, content = $val:expr) => {
        with!(@inline $key_name = $key_val, $val)
    };

    ($key:ident, content = $val:expr) => {{
        with!(@inline $key = $key, $val)
    }};

    ($vis:vis struct $name:ident { $key:ident, $val:ident }) => {
        $crate::__reexport::paste::paste!{
            #[derive(Clone, Debug, Hash,
                PartialEq, Eq,
                PartialOrd, Ord,
                $crate::__reexport::serde::Serialize,
                $crate::__reexport::serde::Deserialize
            )]
            $vis struct $name<K, T> {
                $key: K,
                #[serde(flatten)]
                $val: T,
            }

            impl<K, T> $name<K, T> {
                pub fn new($key: K, $val: T) -> Self {
                    Self { $key, $val }
                }

                pub fn $key(&self) -> &K {
                    &self.$key
                }

                pub fn $val(&self) -> &T {
                    &self.$val
                }

                pub fn[< $key _mut >](&mut self) -> &mut K {
                    &mut self.$key
                }

                pub fn[< $val _mut >](&mut self) -> &mut T {
                    &mut self.$val
                }

                pub fn [< into_ $val >](self) -> T {
                    self.$val
                }

                pub fn [< into_ $key >](self) -> K {
                    self.$key
                }

                pub fn into_pair(self) -> (K, T) {
                    (self.$key, self.$val)
                }
            }
        }
    };
}

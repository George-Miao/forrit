#![allow(incomplete_features)]
#![feature(async_fn_in_trait)]
#![feature(iter_intersperse)]
#![feature(trait_upcasting)]
#![feature(return_position_impl_trait_in_trait)]

pub use futures;
use futures::{stream, Stream};

mod_use::mod_use![model, error, notification];

pub use bangumi;
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

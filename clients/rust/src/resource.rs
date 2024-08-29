use forrit_core::model::{Alias, Download, Meta, PartialEntry, Subscription};
use serde::{de::DeserializeOwned, Serialize};

use crate::resource::sealed::Sealed;

mod sealed {
    pub trait Sealed {}
}

pub trait Resource: Serialize + DeserializeOwned {
    const NAME: &'static str;
}
pub trait List: Sealed {}
pub trait Create: Sealed {}
pub trait Read: Sealed {}
pub trait Update: Sealed {}
pub trait Delete: Sealed {}

macro_rules! impl_resource {
    ($name:ident, $res:ty : $($marker:ident),* $(,)?) => {
        impl Sealed for $res {}

        impl Resource for $res {
            const NAME: &'static str = stringify!($name);
        }

        impl crate::ForritClient {
            pub fn $name(&self) -> crate::ResourceClient<$res> {
                crate::ResourceClient::new(self)
            }
        }

        $(
            impl $marker for $res {}
        )*
    };
}

// These should correspond to api declared in forrit_server::api::run
impl_resource!(entry, PartialEntry: List, Read, Update, Delete);
impl_resource!(meta, Meta: List, Read, Update);
impl_resource!(alias, Alias: List, Create, Read, Update, Delete);
impl_resource!(subscription, Subscription: List, Create, Read, Update, Delete);
impl_resource!(download, Download: List, Read);

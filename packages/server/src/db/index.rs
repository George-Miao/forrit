use mongodb::IndexModel;

pub trait Idx {
    const SORT_INDEX: Option<&'static str>;

    fn indexes() -> impl IntoIterator<Item = IndexModel>;
}

impl Idx for () {
    const SORT_INDEX: Option<&'static str> = None;

    fn indexes() -> impl IntoIterator<Item = IndexModel> {
        []
    }
}

pub trait Resource {
    type Idx: Idx;
}

macro_rules! impl_resource {
    ($r:ty
        $(,sort_by $sort:ident)?
        $(,field($($field:ident),* $(,)? ))?
        $(,index($($idx:expr),*) )?
        $(,)?
    ) => {
        ::camelpaste::paste!{
            const _: () = {
                fn has_field(input: $r) {
                    $(
                        let _ = input.$sort;
                    )?
                    $($(
                        let _ = input.$field;
                    )*)?
                }
            };

            pub struct [<$r Idx>];
            impl [<$r Idx>] {
                #[allow(dead_code)]
                $( pub const [<$sort:upper>]: &'static str = stringify!($sort); )?
                $($( pub const [<$field:upper>]: &'static str = stringify!($field); )*)?
            }

            impl crate::db::Idx for [<$r Idx>] {
                const SORT_INDEX: Option<&'static str> = {
                    #[allow(unreachable_code)]
                    const fn inner() -> Option<&'static str> {
                        $(return Some(stringify!($sort));)? None
                    }
                    inner()
                };

                fn indexes() -> impl IntoIterator<Item = mongodb::IndexModel> {
                    [
                        $(
                            ::mongodb::IndexModel::builder()
                                .keys(mongodb::bson::doc! { stringify!($sort): 1 })
                                .options(
                                    mongodb::options::IndexOptions::builder()
                                        .name(concat!(stringify!($sort), "_index").to_owned())
                                        .build(),
                                )
                                .build(),
                        )?
                        $($(
                            ::mongodb::IndexModel::builder()
                                .keys(mongodb::bson::doc! { stringify!($field): 1 })
                                .options(
                                    mongodb::options::IndexOptions::builder()
                                        .name(concat!(stringify!($field), "_index").to_owned())
                                        .build(),
                                )
                                .build(),
                        )*)?
                        $($(
                            $idx,
                        )*)?
                    ]
                }
            }

            impl crate::db::Resource for $r {
                type Idx = [<$r Idx>];
            }
        }
    };
}

pub(crate) use impl_resource;

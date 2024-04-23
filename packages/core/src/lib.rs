pub mod date;
pub mod model;
mod model_impl;
mod util;

pub use date::DateExt;
#[cfg(feature = "mongodb_pagination")]
pub use list_stream::ListStream;
pub use util::IntoStream;
#[cfg(feature = "mongodb_pagination")]
mod list_stream {
    use std::{
        pin::Pin,
        task::{ready, Context, Poll},
    };

    use futures::{Future, Stream};
    use mongodb_cursor_pagination::Edge;

    use crate::model::{ListParam, ListResult};

    pin_project_lite::pin_project! {
        pub struct ListStream<T, F, Fut> {
            func: F,
            param: ListParam,
            #[pin]
            inner: Option<Fut>,

            res: Option<ListResult<T>>
        }
    }

    impl<T, F, Fut> ListStream<T, F, Fut> {
        pub fn new(func: F) -> Self {
            Self::new_with(func, ListParam::default())
        }

        pub fn new_with(func: F, param: ListParam) -> Self {
            Self {
                func,
                param,
                inner: None,
                res: None,
            }
        }
    }

    impl<T, F, E, Fut> Stream for ListStream<T, F, Fut>
    where
        F: FnMut(Option<Edge>) -> Fut,
        Fut: Future<Output = Result<ListResult<T>, E>>,
    {
        type Item = Result<T, E>;

        fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
            let mut this = self.project();

            // Return all items first
            if let Some(res) = this.res {
                if let Some(item) = res.items.pop() {
                    return Poll::Ready(Some(Ok(item)));
                }
            }

            // No more items
            *this.res = None;

            // First time polling
            if this.inner.is_none() {
                let fut = (this.func)(None);
                this.inner.set(Some(fut));
            }

            *this.res = Some(ready!(this.inner.as_pin_mut().expect("inner is none").poll(cx)?));

            Poll::Pending
        }
    }
}

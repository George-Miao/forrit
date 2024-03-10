pub trait IntoStream {
    type Stream: futures::Stream;
    fn into_stream(self) -> Self::Stream;
}

impl<T: IntoIterator> IntoStream for T {
    type Stream = futures::stream::Iter<T::IntoIter>;

    fn into_stream(self) -> Self::Stream {
        futures::stream::iter(self)
    }
}

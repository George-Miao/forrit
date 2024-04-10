// pub fn iso8601_to_bson(datetime: iso8601::DateTime) -> bson::DateTime {
//     let chrono = datetime.into_fixed_offset().expect("Invalid ISO8601
// datetime");     bson::DateTime::from_chrono(chrono)
// }

pub fn iso8601_to_chrono(datetime: iso8601::DateTime) -> crate::model::DateTime {
    datetime.into_fixed_offset().expect("Invalid ISO8601 datetime")
}
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

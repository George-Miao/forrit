use std::collections::BTreeMap;

use either::Either;
use tap::Pipe;

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde:: Deserialize)]
#[serde(untagged)]
pub enum MapOrVec<T> {
    Map(BTreeMap<String, T>),
    Vec(Vec<T>),
}

impl<T> MapOrVec<T> {
    pub fn len(&self) -> usize {
        match self {
            Self::Map(map) => map.len(),
            Self::Vec(vec) => vec.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        match self {
            Self::Map(map) => map.is_empty(),
            Self::Vec(vec) => vec.is_empty(),
        }
    }

    pub fn iter<'a>(&'a self, vec_prefix: &'a str) -> impl Iterator<Item = (String, &'a T)> + 'a {
        match self {
            Self::Map(map) => map.iter().map(|(k, v)| (k.to_owned(), v)).pipe(Either::Left),
            Self::Vec(vec) => vec
                .iter()
                .enumerate()
                .map(move |(i, v)| (format!("{vec_prefix}{i}"), v))
                .pipe(Either::Right),
        }
    }
}

impl<T> Default for MapOrVec<T> {
    fn default() -> Self {
        Self::Vec(Vec::new())
    }
}

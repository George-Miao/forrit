use std::{collections::BTreeMap, fmt::Display};

use either::Either;
use tap::Pipe;
use url::Url;

use crate::AcgRipConfig;

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

impl AcgRipConfig {
    pub const fn rss_url(&self) -> AcgRipUrl<'_> {
        AcgRipUrl(self)
    }
}

#[must_use]
pub struct AcgRipUrl<'a>(&'a AcgRipConfig);

impl AcgRipUrl<'_> {
    pub fn to_url(&self) -> Url {
        self.to_string().parse().expect("valid URL")
    }
}

impl From<AcgRipUrl<'_>> for Url {
    fn from(value: AcgRipUrl<'_>) -> Self {
        value.to_url()
    }
}

impl Display for AcgRipUrl<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "https://acg.rip")?;
        if let Some(zone) = self.0.zone {
            write!(f, "/{zone}")?;
        }
        if let Some(page) = self.0.page {
            write!(f, "/page/{page}")?;
        }
        write!(f, ".xml",)
    }
}

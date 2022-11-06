use std::{
    any::Any,
    fmt::{Debug, Display},
    path::Path,
};

use dyn_clonable::clonable;
use serde::{Deserialize, Serialize};

use crate::Job;

pub trait Downloader {
    type Error: Display;
    type Config: DownloaderConfig;
    type Id: Debug;

    async fn new_from_dyn_conf(config: &dyn DownloaderConfig) -> Result<Option<Self>, Self::Error>
    where
        Self: Sized,
    {
        let Some(conf) = (config as &dyn Any).downcast_ref::<Self::Config>() else {
            return Ok(None)
        };
        Self::new(conf).await.map(Some)
    }

    async fn new(config: &Self::Config) -> Result<Self, Self::Error>
    where
        Self: Sized;

    async fn download<I: AsRef<str>>(&self, job: Job<I>) -> Result<Option<Self::Id>, Self::Error>;

    async fn rename(
        &self,
        id: &Self::Id,
        func: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Self::Error>;

    async fn add_tracker(
        &self,
        ids: Vec<Self::Id>,
        tracker: Vec<String>,
    ) -> Result<(), Self::Error>;
}

#[typetag::serde(tag = "type")]
#[clonable]
pub trait DownloaderConfig: Any + Debug + Sync + Send + Clone {
    fn erase(self) -> Box<dyn DownloaderConfig>
    where
        Self: Sized,
    {
        Box::new(self)
    }

    fn download_dir(&self) -> &Path;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoopConfig;

#[typetag::serde(name = "noop")]
impl DownloaderConfig for NoopConfig {
    fn download_dir(&self) -> &Path {
        Path::new("")
    }
}

pub struct NoopDownloader;

impl Downloader for NoopDownloader {
    type Config = NoopConfig;
    type Error = String;
    type Id = ();

    async fn download<I: AsRef<str>>(&self, _: Job<I>) -> Result<Option<Self::Id>, Self::Error> {
        Ok(None)
    }

    async fn rename(
        &self,
        _id: &Self::Id,
        _func: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Self::Error> {
        Ok(())
    }

    async fn add_tracker(
        &self,
        _id: Vec<Self::Id>,
        _tracker: Vec<String>,
    ) -> Result<(), Self::Error> {
        Ok(())
    }

    async fn new(_: &Self::Config) -> Result<Self, Self::Error>
    where
        Self: Sized,
    {
        Ok(Self)
    }
}

use std::{borrow::Cow, fmt::Debug};

use forrit_core::{Event, IntoStream, Job};
use futures::{future::join_all, StreamExt};
use serde::{de::DeserializeOwned, Serialize};
use tap::{Pipe, Tap};
use tracing::{debug, info, warn};

use crate::{
    emit, get_config, normalize_title, transmission::Transmission, Error, Result, TapErrExt,
};

pub mod transmission;

pub trait Downloader {
    type Error: std::error::Error + Send + Sync + 'static;
    type Config: DeserializeOwned;
    type Id: Debug;

    async fn new(config: Self::Config) -> Result<Self, Self::Error>
    where
        Self: Sized;

    async fn download(&self, job: Job) -> Result<Option<Self::Id>, Self::Error>;

    async fn add_tracker(
        &self,
        ids: Vec<Self::Id>,
        tracker: Vec<String>,
    ) -> Result<(), Self::Error>;

    async fn rename(
        &self,
        _: &Self::Id,
        _: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Self::Error> {
        Result::<(), Self::Error>::Ok(())
    }
}

#[non_exhaustive]
pub enum Downloaders {
    Transmission(Transmission),
    Noop,
}

#[non_exhaustive]
#[derive(Debug, Serialize)]
#[serde(untagged)]
enum DownloaderId {
    Transmission(transmission_rpc::types::Id),
}

impl DownloaderId {
    fn into_transmission(self) -> Option<transmission_rpc::types::Id> {
        match self {
            DownloaderId::Transmission(x) => Some(x),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum DownloadersConfig {
    Transmission(transmission::TransmissionConfig),
    #[serde(other)]
    Noop,
}

impl Downloaders {
    pub async fn new(config: DownloadersConfig) -> Result<Self, Error>
    where
        Self: Sized,
    {
        match config {
            DownloadersConfig::Transmission(c) => {
                info!("Using Transmission downloader");
                Ok(Self::Transmission(Transmission::new(c).await?))
            }
            DownloadersConfig::Noop => {
                warn!("Using Noop downloader");
                warn!("Please add `[downloader]` section to config file");
                Ok(Self::Noop)
            }
        }
    }

    pub async fn handle_jobs(&self, jobs: impl Iterator<Item = Job>) {
        join_all(jobs.map(|x| {
            emit(&Event::DownloadStart { url: x.url.clone() }).unwrap();
            info!(url=%x.url, "Downloading job");
            self.download(x)
        }))
        .await
        .into_iter()
        .filter_map(|r| r.warn_err().ok().flatten())
        .collect::<Vec<_>>()
        .tap_dbg(|ids| debug!(?ids))
        .pipe(|ids| async move {
            let config = get_config();

            ids.iter()
                .into_stream()
                .for_each_concurrent(None, |id| async {
                    self.rename(id, |name| {
                        let Cow::Owned(modified) = normalize_title(name) else { return None };
                        Some(modified)
                    })
                    .await
                    .warn_err_end();
                })
                .await;
            self.add_tracker(ids, config.trackers.iter().map(|x| x.to_string()).collect())
                .await
                .map_err(|e| Error::AdHocError(e.into()))?;
            Result::<_>::Ok(())
        })
        .await
        .warn_err_end();
    }

    async fn download(&self, job: forrit_core::Job) -> Result<Option<DownloaderId>, Error> {
        match self {
            Self::Transmission(t) => Ok(t.download(job).await?.map(DownloaderId::Transmission)),
            Self::Noop => Ok(None),
        }
    }

    async fn rename(
        &self,
        id: &DownloaderId,
        func: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Error> {
        match (self, id) {
            (Self::Transmission(t), DownloaderId::Transmission(id)) => t.rename(id, func).await,
            _ => Ok(()),
        }
    }

    async fn add_tracker(&self, ids: Vec<DownloaderId>, tracker: Vec<String>) -> Result<(), Error> {
        match self {
            Self::Transmission(t) => {
                let ids = ids
                    .into_iter()
                    .map(|id| id.into_transmission().unwrap_or_else(|| unreachable!()))
                    .collect::<Vec<_>>();
                t.add_tracker(ids, tracker).await
            }
            Self::Noop => Ok(()),
        }
    }
}

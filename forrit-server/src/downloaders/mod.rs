use std::{borrow::Cow, fmt::Debug};

use forrit_core::{Event, IntoStream, Job};
use futures::{future::join_all, StreamExt};
use serde::{de::DeserializeOwned, Serialize};
use tap::{Pipe, Tap, TapFallible};
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
        let rename: fn(&str) -> Option<String> = |name| {
            let Cow::Owned(modified) = normalize_title(name) else { return None };
            Some(modified)
        };

        let res = join_all(jobs.map(|job| async {
            emit(&Event::DownloadStart {
                url: job.url.clone(),
            })
            .unwrap();
            info!(url=%job.url, "Downloading job");
            match self {
                Self::Transmission(t) => Ok(t.download(job).await?.map(DownloaderId::Transmission)),
                Self::Noop => Result::<_>::Ok(None),
            }
        }))
        .await;

        let ok_count = res
            .iter()
            .filter_map(|x| match x {
                Ok(s) => Some(s),
                Err(e) => {
                    warn!("Error sending download: {e}");
                    None
                }
            })
            .count();

        if ok_count != 0 {
            info!("{ok_count} download(s) added");
        } else {
            return;
        }
        res.into_iter()
            .filter_map(|x| x.ok().flatten())
            .collect::<Vec<_>>()
            .pipe(|ids| async move {
                let config = get_config();
                let id_count = ids.len();
                if id_count == 0 {
                    return Result::<_>::Ok(());
                } else {
                    info!("{id_count}/{ok_count} download(s) returned id, post processing");
                }

                ids.iter()
                    .into_stream()
                    .for_each_concurrent(None, |id| async move {
                        match (self, &id) {
                            (Self::Transmission(t), DownloaderId::Transmission(id)) => {
                                t.rename(id, rename).await
                            }
                            _ => Ok(()),
                        }
                        .warn_err_end();
                    })
                    .await;
                self.add_tracker(
                    ids,
                    config.trackers.iter().map(ToString::to_string).collect(),
                )
                .await
                .map_err(|e| Error::AdHocError(e.into()))?;
                Result::<_>::Ok(())
            })
            .await
            .warn_err_end();
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

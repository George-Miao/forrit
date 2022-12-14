use std::path::PathBuf;

use forrit_core::Job;
use futures::future::try_join_all;
use tap::Pipe;
use tracing::warn;
use transmission_rpc::{types as tt, SharableTransClient};

use crate::{config::default, Downloader, Error, TorrentExt};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct TransmissionConfig {
    #[serde(default = "default::download_dir")]
    pub download_dir: PathBuf,

    #[serde(default = "default::transmission_url")]
    pub rpc_url: url::Url,

    #[serde(default)]
    pub auth: Option<(String, String)>,
}

pub struct Transmission {
    trans: SharableTransClient,
    conf: TransmissionConfig,
}

impl Downloader for Transmission {
    type Config = TransmissionConfig;
    type Error = Error;
    type Id = tt::Id;

    async fn new(config: Self::Config) -> Result<Self, Self::Error>
    where
        Self: Sized,
    {
        let mut trans = SharableTransClient::new(config.rpc_url.clone());
        if let Some((user, password)) = config.auth.clone() {
            trans.set_auth(tt::BasicAuth { user, password })
        };
        let res = match trans.session_get().await {
            Ok(x) => x,
            Err(e) => return Err(Error::AdHocError(e)),
        };

        if !res.is_ok() {
            Err(Error::AdHocStringError(format!(
                "transmission session_get failed ({})",
                res.result
            )))
        } else {
            Ok(Self {
                trans,
                conf: config.clone(),
            })
        }
    }

    async fn download(&self, job: Job) -> Result<Option<Self::Id>, Self::Error> {
        use tt::TorrentAddedOrDuplicate::*;

        let Job { url, dir: path, .. } = job;

        let arg = tt::TorrentAddArgs {
            filename: Some(url.to_string()),
            download_dir: Some(
                self.conf
                    .download_dir
                    .join(path)
                    .to_str()
                    .ok_or(Error::NonUTF8Error)?
                    .to_owned(),
            ),
            ..tt::TorrentAddArgs::default()
        };

        match self
            .trans
            .torrent_add(arg)
            .await
            .map_err(Error::AdHocError)?
            .arguments
        {
            TorrentDuplicate(t) | TorrentAdded(t) => t
                .id()
                .expect("Transmission did not return torrent id")
                .pipe(Some)
                .pipe(Ok),
        }
    }

    async fn rename(
        &self,
        id: &Self::Id,
        func: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Self::Error> {
        self.trans
            .torrent_get(
                Some(vec![
                    tt::TorrentGetField::Id,
                    tt::TorrentGetField::HashString,
                    tt::TorrentGetField::Files,
                ]),
                Some(vec![id.clone()]),
            )
            .await
            .map_err(Error::AdHocError)?
            .arguments
            .torrents
            .iter()
            .filter_map(|t| {
                let id = t.id()?;
                match &t.files {
                    Some(f) if f.is_empty() => {
                        warn!("Transmission API returned empty files for id = {id:?}");
                        None
                    }
                    None => {
                        warn!("Transmission API returned none files for id = {id:?}");
                        None
                    }
                    f => f.as_ref(),
                }
            })
            .flat_map(|x| x.iter())
            .map(|f| async {
                let old = &f.name;
                let Some(new) = func(old) else { return Ok(()) };
                self.trans
                    .torrent_rename_path(vec![id.clone()], old.to_owned(), new)
                    .await
                    .map_err(Error::AdHocError)?;
                Result::<_, Error>::Ok(())
            })
            .pipe(try_join_all)
            .await?;

        Ok(())
    }

    async fn rename_all(&self, func: impl Fn(&str) -> Option<String>) -> Result<(), Self::Error> {
        self.trans
            .torrent_get(
                Some(vec![
                    tt::TorrentGetField::Id,
                    tt::TorrentGetField::HashString,
                    tt::TorrentGetField::Files,
                ]),
                None,
            )
            .await
            .map_err(Error::AdHocError)?
            .arguments
            .torrents
            .iter()
            .filter_map(|t| {
                let id = t.id()?;
                match &t.files {
                    Some(f) if f.is_empty() => {
                        warn!("Transmission API returned empty files for id = {id:?}");
                        None
                    }
                    None => {
                        warn!("Transmission API returned none files for id = {id:?}");
                        None
                    }
                    f => (id, f.as_ref()?).pipe(Some),
                }
            })
            .flat_map(|(id, x)| std::iter::repeat(id).zip(x.iter()))
            .map(|(id, t)| async {
                let old = &t.name;
                let Some(new) = func(old) else { return Ok(()) };
                self.trans
                    .torrent_rename_path(vec![id], old.to_owned(), new)
                    .await
                    .map_err(Error::AdHocError)?;
                Result::<_, Error>::Ok(())
            })
            .pipe(try_join_all)
            .await?;

        Ok(())
    }

    async fn add_tracker(
        &self,
        id: Vec<Self::Id>,
        tracker: Vec<String>,
    ) -> Result<(), Self::Error> {
        self.trans
            .torrent_set(
                tt::TorrentSetArgs {
                    tracker_add: Some(tracker),
                    ..Default::default()
                },
                Some(id),
            )
            .await
            .map_err(Error::AdHocError)?;
        Ok(())
    }
}

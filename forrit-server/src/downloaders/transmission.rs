use std::path::{Path, PathBuf};

use color_eyre::{
    eyre::{ensure, eyre},
    Report, Result,
};
use forrit_core::{typetag, Downloader, DownloaderConfig, Job};
use futures::future::try_join_all;
use transmission_rpc::{types as tt, SharableTransClient};

use crate::{config::default, TorrentExt};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct TransmissionConfig {
    #[serde(default = "default::download_dir")]
    pub download_dir: PathBuf,

    #[serde(default = "default::transmission_url")]
    pub rpc_url: url::Url,

    #[serde(default)]
    pub auth: Option<(String, String)>,
}

#[typetag::serde(name = "transmission")]
impl DownloaderConfig for TransmissionConfig {
    fn download_dir(&self) -> &Path {
        &self.download_dir
    }
}

pub struct Transmission {
    trans: SharableTransClient,
}

impl Downloader for Transmission {
    type Config = TransmissionConfig;
    type Error = Report;
    type Id = tt::Id;

    async fn new(config: &Self::Config) -> Result<Self, Self::Error>
    where
        Self: Sized,
    {
        let mut trans = SharableTransClient::new(config.rpc_url.clone());
        if let Some((user, password)) = config.auth.clone() {
            trans.set_auth(tt::BasicAuth { user, password })
        };
        let res = trans
            .session_get()
            .await
            .map_err(|e| eyre!("Unable to call transmission rpc: {}", e))?;
        ensure!(
            res.is_ok(),
            "Transmission rpc returned an error ({})",
            res.result
        );
        Ok(Self { trans })
    }

    async fn download<I: AsRef<str>>(&self, job: Job<I>) -> Result<Option<Self::Id>, Self::Error> {
        use tt::TorrentAddedOrDuplicate::*;

        let Job { url, dir: path, .. } = job;

        let arg = tt::TorrentAddArgs {
            filename: Some(url.to_string()),
            download_dir: Some(
                path.to_str()
                    .ok_or_else(|| {
                        eyre!("Path `{}` contains non UTF-8 char, skipped", path.display())
                    })?
                    .to_owned(),
            ),
            ..tt::TorrentAddArgs::default()
        };

        match self
            .trans
            .torrent_add(arg)
            .await
            .map_err(|e| eyre!(e))?
            .arguments
        {
            TorrentDuplicate(t) | TorrentAdded(t) => Ok(t.id()),
        }
    }

    async fn rename(
        &self,
        id: &Self::Id,
        func: impl Fn(&str) -> Option<String>,
    ) -> Result<(), Self::Error> {
        let torrent = self
            .trans
            .torrent_get(
                Some(vec![
                    tt::TorrentGetField::Id,
                    tt::TorrentGetField::HashString,
                    tt::TorrentGetField::Files,
                ]),
                Some(vec![id.clone()]),
            )
            .await
            .map_err(|e| eyre!(e))?;
        let Some(files) = torrent.arguments
            .torrents.get(0).and_then(|t| t.files.as_ref()) else {
                return Ok(())
            };

        try_join_all(files.iter().map(|f| async {
            let old = &f.name;
            let Some(new) = func(old) else { return Ok(()) };
            self.trans
                .torrent_rename_path(vec![id.clone()], old.to_owned(), new)
                .await
                .map_err(|e| eyre!(e))?;
            Result::<_>::Ok(())
        }))
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
            .map_err(|e| eyre!(e))?;
        Ok(())
    }
}

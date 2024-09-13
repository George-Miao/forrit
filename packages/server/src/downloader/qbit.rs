use std::{borrow::Cow, time::Duration};

use camino::Utf8PathBuf;
use forrit_config::QbittorrentConfig;
use forrit_core::{model::DownloadState, IntoStream};
use futures::{future::try_join_all, StreamExt};
use mongodb::bson::oid::ObjectId;
use qbit_rs::{
    model::{AddTorrentArg, Credential, GetTorrentListArg, Torrent, TorrentSource},
    Qbit,
};
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef};
use reqwest::Client;
use tap::Pipe;
use tracing::{debug, info, warn};

use crate::{
    downloader::{Download, DownloadManager, Message},
    util::{normalize_title, timestamp},
};

pub struct QbitActor {
    qbit: Qbit,
    config: &'static QbittorrentConfig,
    manager: DownloadManager,
}

impl QbitActor {
    pub fn new(client: Client, config: &'static QbittorrentConfig, manager: DownloadManager) -> Self {
        let qbit = Qbit::new_with_client(
            config.url.clone(),
            Credential::new(config.auth.username.to_owned(), config.auth.password.to_owned()),
            client,
        );

        QbitActor { qbit, config, manager }
    }
}

pub struct State {
    savepath: Utf8PathBuf,
    rename_job: Option<JoinHandle<()>>,
    downloading: Vec<ObjectId>, // TODO: Use downloading
}

impl Actor for QbitActor {
    type Arguments = ();
    type Msg = super::Message;
    type State = State;

    async fn pre_start(&self, this: ActorRef<Message>, _: Self::Arguments) -> Result<Self::State, ActorProcessingErr> {
        info!("QBit actor starting");
        let downloading = Vec::with_capacity(16);
        let rename_job = if self.manager.config.rename.enable {
            ractor::time::send_interval(self.manager.config.rename.interval, this.get_cell(), || Message::Rename)
                .pipe(Some)
        } else {
            None
        };
        if let Some(savepath) = self.config.savepath.clone() {
            Ok(State {
                savepath,
                rename_job,
                downloading,
            })
        } else {
            self.qbit
                .get_default_save_path()
                .await?
                .pipe(|savepath| State {
                    savepath: Utf8PathBuf::from_path_buf(savepath).expect("Non utf-8 path"),
                    rename_job,
                    downloading,
                })
                .pipe(Ok)
        }
    }

    async fn handle(
        &self,
        _: ActorRef<Message>,
        msg: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            Message::NewDownload(job) => {
                self.download(job, state).await?;
            }
            Message::NewDownloadAdded(id) => {
                let Some(job) = self.manager.download.get_one(id).await? else {
                    warn!(%id, "Download not found");
                    return Ok(());
                };
                self.manager.update_state(id, DownloadState::Downloading).await?;
                self.download(job.inner, state).await?;
            }
            Message::Rename => self.rename().await,
        }
        Ok(())
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        if let Some(ref handle) = state.rename_job {
            handle.abort()
        }
        Ok(())
    }
}

impl QbitActor {
    async fn download(&self, job: Download, state: &State) -> Result<(), ActorProcessingErr> {
        let Some(prepared) = self.manager.prepare(job).await? else {
            return Ok(());
        };
        let url = prepared.entry.inner.base.torrent;
        let path = state.savepath.join(prepared.path);

        AddTorrentArg::builder()
            .source(TorrentSource::Urls { urls: vec![url].into() })
            .savepath(path.to_string())
            .build()
            .pipe(|arg| self.qbit.add_torrent(arg))
            .await?;

        Ok(())
    }

    fn should_rename(&self, torrent: &Torrent) -> bool {
        const ONE_HOUR: Duration = Duration::from_secs(3600);
        (|| {
            let added = timestamp(torrent.added_on? as _)
                .elapsed()
                .unwrap_or_else(|_| Duration::from_secs(0));
            Some(added < ONE_HOUR)
        })()
        .unwrap_or(false)
    }

    async fn rename(&self) {
        let res = GetTorrentListArg::builder()
            .sort("added_on".to_owned())
            .limit(100)
            .reverse(true)
            .build()
            .pipe(|arg| self.qbit.get_torrent_list(arg))
            .await;
        let list = match res {
            Ok(list) => list,
            Err(error) => {
                warn!(%error, "Failed to get torrent list");
                return;
            }
        };
        list.into_iter()
            .filter_map(|x| self.should_rename(&x).then_some(x.hash?))
            .into_stream()
            .for_each_concurrent(None, |hash| async move {
                if let Err(error) = self.rename_one(&hash).await {
                    warn!(%hash, %error, "Failed to rename torrent");
                }
            })
            .await;
    }

    async fn rename_one(&self, hash: &str) -> Result<(), qbit_rs::Error> {
        let files = self.qbit.get_torrent_contents(&hash, None).await?;
        if files.is_empty() {
            debug!("Did not find any files to rename");
            return Ok(());
        }
        files
            .into_iter()
            .filter_map(|x| {
                let old = &x.name;
                if let Cow::Owned(new) = normalize_title(old, &self.manager.config.rename.format) {
                    info!("Renaming qbit file {old} -> {new}");
                    Some((x.name, new))
                } else {
                    debug!("Skip renaming qbit file {old}");
                    None
                }
            })
            .map(|(old, new)| async { self.qbit.rename_file(&hash, old, new).await })
            .pipe(try_join_all)
            .await?;
        Ok(())
    }
}

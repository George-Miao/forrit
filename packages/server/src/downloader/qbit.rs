use std::{borrow::Cow, collections::HashMap, time::Duration};

use camino::Utf8PathBuf;
use forrit_config::QbittorrentConfig;
use forrit_core::{
    model::{DownloadState, WithId},
    IntoStream,
};
use futures::{future::try_join_all, StreamExt, TryStreamExt};
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
    downloader::{DownloadManager, Job, Message},
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

#[derive(Debug, Clone, Default)]
struct ActiveDownload {
    id: ObjectId,
}

impl ActiveDownload {
    fn new(id: ObjectId) -> Self {
        Self { id }
    }
}

pub struct State {
    check_id: i64,
    /// Map of torrent hash to name given by qbit
    qb_torrents: HashMap<String, String>,
    /// Map of name to download job spawned by us
    downloading: HashMap<String, ActiveDownload>,
    savepath: Utf8PathBuf,
    rename_job: Option<JoinHandle<()>>,
    check_job: JoinHandle<()>,
}

impl Actor for QbitActor {
    type Arguments = ();
    type Msg = super::Message;
    type State = State;

    async fn pre_start(&self, this: ActorRef<Message>, _: Self::Arguments) -> Result<Self::State, ActorProcessingErr> {
        info!("QBit actor starting");
        let rename_job = if self.manager.config.rename.enable {
            ractor::time::send_interval(self.manager.config.rename.interval, this.get_cell(), || Message::Rename)
                .pipe(Some)
        } else {
            None
        };
        let check_job = ractor::time::send_interval(self.config.check_interval, this.get_cell(), || Message::Check);

        let savepath = if let Some(savepath) = self.config.savepath.clone() {
            savepath
        } else {
            info!("No save path provided, using default save path");
            self.qbit
                .get_default_save_path()
                .await?
                .try_into()
                .expect("Non utf-8 path")
        };

        Ok(State {
            check_id: 0,
            qb_torrents: HashMap::new(),
            downloading: HashMap::new(),
            savepath,
            rename_job,
            check_job,
        })
    }

    async fn post_start(&self, _: ActorRef<Message>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        let mut pending_jobs = self.manager.pending_jobs().await?;

        while let Some(job) = pending_jobs.try_next().await? {
            self.download(job, state).await?;
        }

        let mut downloading_jobs = self.manager.downloading_jobs().await?;

        while let Some(job) = downloading_jobs.try_next().await? {
            state.downloading.insert(job.inner.name, ActiveDownload::new(job.id));
        }

        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Message>,
        msg: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            Message::NewDownloadAdded(id) => {
                if let Some(job) = self.manager.jobs.get_one(id).await? {
                    self.download(job, state).await?;
                } else {
                    warn!(%id, "Job not found");
                };
            }
            Message::Rename => self.rename().await,
            Message::Check => self.check(state).await?,
        }
        Ok(())
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        info!("QBit actor stopping");
        if let Some(ref handle) = state.rename_job {
            handle.abort()
        }
        state.check_job.abort();
        Ok(())
    }
}

impl QbitActor {
    async fn download(&self, job: WithId<Job>, state: &mut State) -> Result<(), ActorProcessingErr> {
        let (id, job) = job.split();
        let Some(prepared) = self.manager.prepare(job).await? else {
            self.manager.update_state(id, DownloadState::Failed).await?;
            return Ok(());
        };

        let url = prepared.entry.inner.base.torrent;
        let path = state.savepath.join(prepared.path);

        let res = AddTorrentArg::builder()
            .source(TorrentSource::Urls { urls: vec![url].into() })
            .savepath(path.to_string())
            .build()
            .pipe(|arg| self.qbit.add_torrent(arg))
            .await;

        if res.is_err() {
            self.manager.update_state(id, DownloadState::Failed).await?;
        } else {
            self.manager.update_state(id, DownloadState::Downloading).await?;
            state
                .downloading
                .insert(prepared.download.name, ActiveDownload::new(id));
        }

        Ok(())
    }

    async fn check(&self, state: &mut State) -> Result<(), ActorProcessingErr> {
        let maindata = self.qbit.sync(state.check_id).await?;
        state.check_id += 1;

        for hash in maindata.torrents_removed.into_iter().flat_map(|x| x.into_iter()) {
            if let Some(name) = state.qb_torrents.remove(&hash)
                && let Some(active) = state.downloading.remove(&name)
            {
                self.manager.update_state(active.id, DownloadState::Cancelled).await?;
            }
        }

        let iter = maindata.torrents.into_iter().flat_map(|x| x.into_iter());

        for (hash, torrent) in iter {
            let name = if let Some(name) = torrent.name {
                state.qb_torrents.entry(hash).or_insert(name)
            } else {
                state
                    .qb_torrents
                    .get_mut(&hash)
                    .expect("When we first see a torrent, it should come with its full data")
            };

            let Some(active) = state.downloading.get(name) else {
                // Not our download, skip it
                continue;
            };

            if let Some(state) = torrent.state {
                use qbit_rs::model::State::*;

                match state {
                    // Error state
                    Error | MissingFiles => {
                        self.manager.update_state(active.id, DownloadState::Failed).await?;
                    }
                    // Finished state
                    Uploading | PausedUP | QueuedUP | StalledUP | CheckingUP | ForcedUP => {
                        self.manager.update_state(active.id, DownloadState::Finished).await?;
                    }
                    // Downloading state
                    Allocating | Downloading | MetaDL | PausedDL | QueuedDL | StalledDL | CheckingDL | ForcedDL => {
                        self.manager.update_state(active.id, DownloadState::Downloading).await?;
                    }
                    // No-action state
                    CheckingResumeData | Moving | Unknown => {}
                }
            }
        }

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

use std::{
    borrow::Cow,
    ops::Deref,
    sync::Arc,
    time::{Duration, UNIX_EPOCH},
};

use color_eyre::Result;
use forrit_core::{futures::future::try_join_all, normalize_title, Job as ForritJob};
use qbit_rs::model as qb;
use ractor::{
    factory::{
        Factory, FactoryMessage, Job, JobOptions, WorkerBuilder, WorkerId, WorkerMessage,
        WorkerStartContext,
    },
    Actor, ActorProcessingErr, ActorRef,
};
use tap::Pipe;
use tracing::{debug, info, warn};
use transmission_rpc::types as tr;

use crate::{
    get_config, new_factory, DownloadersConfig, Id, QbittorrentConfig, TransmissionConfig,
    HTTP_CLIENT,
};

pub struct DownloadCluster {
    client: Arc<Client>,
}

impl DownloadCluster {
    pub fn new(config: DownloadersConfig) -> Self {
        match config {
            DownloadersConfig::Qbittorrent(config) => {
                let client = qbit_rs::Qbit::new_with_client(
                    config.url.clone(),
                    qb::Credential::new(
                        config.auth.username.to_owned(),
                        config.auth.password.to_owned(),
                    ),
                    HTTP_CLIENT.clone(),
                );
                Client::Qbit((client, config))
            }
            DownloadersConfig::Transmission(config) => {
                let mut client = transmission_rpc::SharableTransClient::new(config.url.clone());
                if let Some(auth) = config.auth.clone() {
                    client.set_auth(tr::BasicAuth {
                        user: auth.username,
                        password: auth.password,
                    });
                }
                Client::Transmission((client, config))
            }
        }
        .pipe(Arc::new)
        .pipe(|client| Self { client })
    }

    pub async fn spawn(self) -> Result<()> {
        let factory = new_factory();
        let builder = self.worker_builder();

        Actor::spawn(Some("downloader".to_owned()), factory, builder).await?;

        Ok(())
    }

    fn worker_builder(&self) -> Box<dyn WorkerBuilder<DownloadWorker>> {
        struct DownloadWorkerBuilder {
            client: Arc<Client>,
        }

        impl WorkerBuilder<DownloadWorker> for DownloadWorkerBuilder {
            fn build(&self, id: WorkerId) -> DownloadWorker {
                DownloadWorker {
                    id,
                    client: self.client.clone(),
                }
            }
        }

        Box::new(DownloadWorkerBuilder {
            client: self.client.clone(),
        })
    }
}

#[allow(clippy::large_enum_variant)]
enum Client {
    Qbit((qbit_rs::Qbit, QbittorrentConfig)),
    Transmission((transmission_rpc::SharableTransClient, TransmissionConfig)),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DownloadWorkerMessage {
    Job(ForritJob),
    Rename(Option<String>),
}

pub struct DownloadWorkerState {
    factory: ActorRef<Factory<Id, DownloadWorkerMessage, DownloadWorker>>,
}

pub struct DownloadWorker {
    id: WorkerId,
    client: Arc<Client>,
}

impl DownloadWorker {
    async fn download(
        &self,
        key: Id,
        forrit_job: ForritJob,
        state: &mut DownloadWorkerState,
    ) -> Result<(), ActorProcessingErr> {
        let ForritJob { url, dir, id } = forrit_job;
        debug!(%url, dir = %dir.display(), %id, "Downloading");
        let DownloadWorkerState { factory } = state;

        if get_config().dry_run {
            info!(%url, dir = %dir.display(), %id, "Download");
            return Ok(());
        }

        let dir = dir.to_str().expect("Non utf-8 path").to_owned();

        match self.client.deref() {
            Client::Qbit((client, config)) => {
                let path = config
                    .download_dir
                    .join(dir)
                    .to_str()
                    .expect("Non utf-8 path")
                    .to_owned();
                info!(%url, %path, "Adding torrent to qbit");
                let arg = qb::AddTorrentArg::builder()
                    .source(qb::TorrentSource::Urls {
                        urls: vec![url].into(),
                    })
                    .savepath(path)
                    .build();

                client.add_torrent(arg).await?;

                factory.send_after(Duration::SECOND, move || {
                    FactoryMessage::Dispatch(Job {
                        key,
                        msg: DownloadWorkerMessage::Rename(None),
                        options: JobOptions::default(),
                    })
                });
            }
            Client::Transmission((client, config)) => {
                let path = config
                    .download_dir
                    .join(dir)
                    .to_str()
                    .expect("Non utf-8 path")
                    .to_owned();
                info!(%url, %path, "Adding torrent to transmission");
                let arg = tr::TorrentAddArgs {
                    filename: Some(url.to_string()),
                    download_dir: Some(path),
                    ..tr::TorrentAddArgs::default()
                };
                let id = match client.torrent_add(arg).await?.arguments {
                    tr::TorrentAddedOrDuplicate::TorrentDuplicate(t)
                    | tr::TorrentAddedOrDuplicate::TorrentAdded(t) => {
                        t.id().expect("Transmission did not return torrent id")
                    }
                };

                factory.send_after(Duration::SECOND, move || {
                    FactoryMessage::Dispatch(Job {
                        key,
                        msg: trans_id_to_string(id.clone())
                            .pipe(Some)
                            .pipe(DownloadWorkerMessage::Rename),
                        options: JobOptions::default(),
                    })
                });
            }
        }
        Ok(())
    }

    async fn rename(
        &self,
        key: Id,
        id: Option<String>,
        state: &mut DownloadWorkerState,
    ) -> Result<(), ActorProcessingErr> {
        let DownloadWorkerState { factory } = state;
        match self.client.deref() {
            Client::Qbit((client, _)) => {
                if let Some(id) = id {
                    let files = client.get_torrent_contents(&id, None).await?;
                    files
                        .into_iter()
                        .filter_map(|x| {
                            let old = &x.name;
                            if let Cow::Owned(new) = normalize_title(old) {
                                info!("Renaming qbit file {old} -> {new}");
                                Some((x.name, new))
                            } else {
                                debug!("Skip renaming qbit file {old}");
                                None
                            }
                        })
                        .map(|(old, new)| async {
                            client.rename_file(&id, old, new).await?;
                            Ok::<_, ActorProcessingErr>(())
                        })
                        .pipe(try_join_all)
                        .await?;
                } else {
                    client
                        .get_torrent_list(Default::default())
                        .await?
                        .into_iter()
                        .filter_map(|x| {
                            ((UNIX_EPOCH + Duration::from_secs(x.added_on? as u64))
                                .elapsed()
                                .ok()?
                                < 5 * 60 * Duration::SECOND) // 5 minutes
                                .then_some(x.hash?)
                        })
                        .try_for_each(|x| {
                            factory.send_message(FactoryMessage::Dispatch(Job {
                                key,
                                msg: DownloadWorkerMessage::Rename(Some(x)),
                                options: JobOptions::default(),
                            }))
                        })?
                }
            }
            Client::Transmission((client, _)) => {
                let Some(id) = id else { return Ok(()) };
                let id = trans_string_to_id(id);

                client
                    .torrent_get(
                        Some(vec![
                            tr::TorrentGetField::Id,
                            tr::TorrentGetField::HashString,
                            tr::TorrentGetField::Files,
                        ]),
                        Some(vec![id.clone()]),
                    )
                    .await?
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

                        let new = if let Cow::Owned(new) = normalize_title(old) {
                            new
                        } else {
                            debug!("Skip renaming transmission file {old}");
                            return Ok(());
                        };

                        info!("Renaming transmission file {old} -> {new}");

                        client
                            .torrent_rename_path(vec![id.clone()], old.to_owned(), new)
                            .await?;
                        Result::<(), ActorProcessingErr>::Ok(())
                    })
                    .pipe(try_join_all)
                    .await?;
            }
        }
        Ok(())
    }
}

#[async_trait::async_trait]
impl Actor for DownloadWorker {
    type Arguments = WorkerStartContext<Id, DownloadWorkerMessage, Self>;
    type Msg = WorkerMessage<Id, DownloadWorkerMessage>;
    type State = DownloadWorkerState;

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        arg: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(DownloadWorkerState {
            factory: arg.factory,
        })
    }

    async fn post_start(
        &self,
        _: ActorRef<Self>,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        info!("Download worker #{} started", self.id);

        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self>,
        msg: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            WorkerMessage::FactoryPing(i) => state
                .factory
                .send_message(FactoryMessage::WorkerPong(self.id, i))?,
            WorkerMessage::Dispatch(job) => {
                let Job { key, msg, .. } = job;
                match msg {
                    DownloadWorkerMessage::Job(job) => {
                        self.download(key, job, state).await?;
                    }
                    DownloadWorkerMessage::Rename(id) => {
                        self.rename(key, id, state).await?;
                    }
                }
                state
                    .factory
                    .send_message(FactoryMessage::Finished(self.id, key))?;
            }
        }
        Ok(())
    }
}

fn trans_id_to_string(id: tr::Id) -> String {
    match id {
        tr::Id::Id(id) => format!("{}", id),
        tr::Id::Hash(hash) => hash,
    }
}

fn trans_string_to_id(string: String) -> tr::Id {
    if let Ok(id) = string.parse() {
        tr::Id::Id(id)
    } else {
        tr::Id::Hash(string)
    }
}

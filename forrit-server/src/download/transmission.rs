use std::{borrow::Cow, ops::Deref, sync::Arc, time::Duration};

use color_eyre::Result;
use forrit_core::{futures::future::try_join_all, normalize_title, Job as ForritJob};
use ractor::{
    factory::{FactoryMessage, Job, JobOptions, WorkerId, WorkerMessage, WorkerStartContext},
    Actor, ActorProcessingErr, ActorRef,
};
use tap::Pipe;
use transmission_rpc::{types as tr, SharableTransClient};

use crate::{
    get_config, new_factory, DownloadWorkerMessage, DownloadWorkerState, Id, TransmissionConfig,
    WorkerBuilderClosure, HTTP_CLIENT,
};

pub struct TransmissionCluster(Arc<(SharableTransClient, TransmissionConfig)>);

impl TransmissionCluster {
    pub fn new(config: TransmissionConfig) -> Self {
        let mut client = transmission_rpc::SharableTransClient::new_with_client(
            config.url.clone(),
            HTTP_CLIENT.clone(),
        );
        if let Some(auth) = config.auth.clone() {
            client.set_auth(tr::BasicAuth {
                user: auth.username,
                password: auth.password,
            });
        }
        Self(Arc::new((client, config)))
    }

    pub async fn spawn(self) -> Result<()> {
        let factory = new_factory();
        let builder = WorkerBuilderClosure::new(move |id| TransmissionWorker {
            inner: self.0.clone(),
            id,
        })
        .boxed();

        Actor::spawn(Some("downloader".to_owned()), factory, builder).await?;

        Ok(())
    }
}

pub struct TransmissionWorker {
    inner: Arc<(SharableTransClient, TransmissionConfig)>,
    id: WorkerId,
}

#[async_trait::async_trait]
impl Actor for TransmissionWorker {
    type Arguments = WorkerStartContext<Id, DownloadWorkerMessage, Self>;
    type Msg = WorkerMessage<Id, DownloadWorkerMessage>;
    type State = DownloadWorkerState<Self>;

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
                    DownloadWorkerMessage::Rename(id, retry_count) => {
                        self.rename(key, retry_count, id, state).await?;
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

impl TransmissionWorker {
    async fn download(
        &self,
        key: Id,
        forrit_job: ForritJob,
        state: &mut DownloadWorkerState<Self>,
    ) -> Result<(), ActorProcessingErr> {
        let ForritJob { url, dir, id } = forrit_job;
        debug!(%url, dir = %dir.display(), %id, "Downloading");
        let DownloadWorkerState { factory } = state;

        if get_config().dry_run {
            info!(%url, dir = %dir.display(), %id, "Download");
            return Ok(());
        }

        let dir = dir.to_str().expect("Non utf-8 path").to_owned();

        let (client, config) = self.inner.deref();

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
                    .pipe(|x| DownloadWorkerMessage::Rename(x, 3)),
                options: JobOptions::default(),
            })
        });
        Ok(())
    }

    async fn rename(
        &self,
        key: Id,
        retry_count: u8,
        id: Option<String>,
        state: &mut DownloadWorkerState<Self>,
    ) -> Result<(), ActorProcessingErr> {
        let DownloadWorkerState { factory } = state;

        let (client, config) = self.inner.deref();

        let Some(id) = id else { return Ok(()) };
        let id = trans_string_to_id(id);

        let t = client
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
            .torrents;
        if t.is_empty() {
            if retry_count != 0 {
                factory.send_after(Duration::SECOND * 5, move || {
                    FactoryMessage::Dispatch(Job {
                        key,
                        msg: DownloadWorkerMessage::Rename(
                            Some(trans_id_to_string(id.clone())),
                            retry_count - 1,
                        ),
                        options: JobOptions::default(),
                    })
                });
            }
            return Ok(());
        }
        t.iter()
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

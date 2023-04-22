use std::{
    borrow::Cow,
    ops::Deref,
    sync::Arc,
    time::{Duration, UNIX_EPOCH},
};

use color_eyre::Result;
use forrit_core::{futures::future::try_join_all, normalize_title, Job as ForritJob};
use qbit_rs::{
    model::{AddTorrentArg, Credential, TorrentSource},
    Qbit,
};
use ractor::{
    factory::{FactoryMessage, Job, JobOptions, WorkerId, WorkerMessage, WorkerStartContext},
    Actor, ActorProcessingErr, ActorRef,
};
use tap::Pipe;

use crate::{
    emit, get_config, impl_worker_log, new_factory, DownloadWorkerMessage, DownloadWorkerState, Id,
    Notification, NotificationChunk, QbittorrentConfig, WorkerBuilderClosure, HTTP_CLIENT,
};

pub struct QbitCluster(Arc<(Qbit, QbittorrentConfig)>);

impl QbitCluster {
    pub fn new(config: QbittorrentConfig) -> Self {
        let client = Qbit::new_with_client(
            config.url.clone(),
            Credential::new(
                config.auth.username.to_owned(),
                config.auth.password.to_owned(),
            ),
            HTTP_CLIENT.clone(),
        );
        Self(Arc::new((client, config)))
    }

    pub async fn spawn(self) -> Result<()> {
        let factory = new_factory();
        let builder = WorkerBuilderClosure::new(move |id| QbitWorker {
            inner: self.0.clone(),
            id,
        })
        .boxed();

        Actor::spawn(Some("downloader".to_owned()), factory, builder).await?;

        Ok(())
    }
}

pub struct QbitWorker {
    inner: Arc<(Qbit, QbittorrentConfig)>,
    id: WorkerId,
}

#[async_trait::async_trait]
impl Actor for QbitWorker {
    type Arguments = WorkerStartContext<Id, DownloadWorkerMessage, Self>;
    type Msg = WorkerMessage<Id, DownloadWorkerMessage>;
    type State = DownloadWorkerState<Self>;

    impl_worker_log!(this => format!("Qbit download worker #{}", this.id));

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        arg: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(DownloadWorkerState {
            factory: arg.factory,
        })
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
                        let n = Notification::new().with(NotificationChunk::Paragraph {
                            title: "New download added".to_owned(),
                            content: format!(
                                "Torrent <code>{}</code> is downloading to <code>{}</code>",
                                job.url,
                                job.dir.display()
                            ),
                            title_url: None,
                        });
                        self.download(key, job, state).await?;
                        emit(n).ok();
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

impl QbitWorker {
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
        info!(%url, %path, "Adding torrent to qbit");
        let arg = AddTorrentArg::builder()
            .source(TorrentSource::Urls {
                urls: vec![url].into(),
            })
            .savepath(path)
            .build();

        client.add_torrent(arg).await?;

        factory.send_after(Duration::SECOND, move || {
            FactoryMessage::Dispatch(Job {
                key,
                msg: DownloadWorkerMessage::Rename(None, 3),
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

        let (client, _) = self.inner.deref();

        if let Some(id) = id {
            let files = client.get_torrent_contents(&id, None).await?;
            if files.is_empty() {
                if retry_count != 0 {
                    factory.send_after(Duration::SECOND * 5, move || {
                        FactoryMessage::Dispatch(Job {
                            key,
                            msg: DownloadWorkerMessage::Rename(Some(id.clone()), retry_count - 1),
                            options: JobOptions::default(),
                        })
                    });
                } else {
                    debug!("Did not find files to rename, giving up");
                }
                return Ok(());
            }
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
                        < 60 * 60 * Duration::SECOND) // 1 hour
                        .then_some(x.hash?)
                })
                .try_for_each(|x| {
                    factory.send_message(FactoryMessage::Dispatch(Job {
                        key,
                        msg: DownloadWorkerMessage::Rename(Some(x), 3),
                        options: JobOptions::default(),
                    }))
                })?
        }

        Ok(())
    }
}

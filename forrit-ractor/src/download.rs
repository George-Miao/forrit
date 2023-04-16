use std::{
    borrow::Cow,
    ops::Deref,
    sync::{Arc, LazyLock},
    time::Duration,
};

use color_eyre::Result;
use forrit_core::{futures::future::try_join_all, Job as ForritJob};
use http_client::hyper::HyperClient;
use mongodb::bson::oid::ObjectId;
use qbit_rs::model as qb;
use ractor::{
    factory::{
        Factory, FactoryMessage, Job, JobOptions, WorkerBuilder, WorkerId, WorkerMessage,
        WorkerStartContext,
    },
    Actor, ActorProcessingErr, ActorRef, BytesConvertable, Message,
};
use regex::Regex;
use tap::Pipe;
use tracing::{debug, info, warn};
use transmission_rpc::types as tr;

use crate::{DownloadersConfig, QbittorrentConfig, TransmissionConfig};

pub fn normalize_title(title: &str) -> Cow<'_, str> {
    macro_rules! rule {
        ($reg:literal) => {
            Regex::new($reg).expect("Regex should compile")
        };
    }
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            rule!(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#),
            rule!(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#),
        ]
    });

    PATTERNS
        .iter()
        .find_map(|pat| {
            pat.captures(title).and_then(|cap| {
                let pre = cap.get(1)?.as_str().trim();
                let episode = cap.get(2)?.as_str().trim();
                let suf = cap.get(3)?.as_str().trim();

                Some(format!("{pre} E{episode} {suf}").into())
            })
        })
        .unwrap_or_else(|| title.into())
}

pub struct DownloadCluster {
    client: Arc<Client>,
}

pub enum DownloadWorkerMessage {
    Job(ForritJob),
    Rename(String),
}

impl Message for DownloadWorkerMessage {}

impl DownloadCluster {
    pub fn new(config: DownloadersConfig) -> Result<Self> {
        match config {
            DownloadersConfig::Qbittorrent(config) => {
                let client = qbit_rs::Qbit::new(
                    config.url.clone(),
                    qb::Credential::new(
                        config.auth.username.to_owned(),
                        config.auth.password.to_owned(),
                    ),
                    HyperClient::new(),
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
        .pipe(Ok)
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

    pub async fn spawn(self) -> Result<()> {
        let factory = Factory::default(); // TODO: factory config
        let builder = self.worker_builder();

        Actor::spawn(Some("downloader_cluster".to_owned()), factory, builder).await?;

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Hash)]
struct Id(ObjectId);

impl BytesConvertable for Id {
    fn from_bytes(bytes: Vec<u8>) -> Self {
        Self(ObjectId::from_bytes(bytes[..12].try_into().unwrap()))
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.bytes().to_vec()
    }
}

#[allow(clippy::large_enum_variant)]
enum Client {
    Qbit((qbit_rs::Qbit<HyperClient>, QbittorrentConfig)),
    Transmission((transmission_rpc::SharableTransClient, TransmissionConfig)),
}

struct DownloadWorkerState {
    factory: ActorRef<Factory<Id, DownloadWorkerMessage, DownloadWorker>>,
}

struct DownloadWorker {
    id: WorkerId,
    client: Arc<Client>,
}

impl DownloadWorker {
    async fn download(
        &self,
        job_key: Id,
        forrit_job: ForritJob,
        state: &mut DownloadWorkerState,
    ) -> Result<(), ActorProcessingErr> {
        let ForritJob { url, dir, .. } = forrit_job;
        let DownloadWorkerState { factory } = state;
        let dir = dir.to_str().expect("Non utf-8 path").to_owned();

        match self.client.deref() {
            Client::Qbit((client, config)) => {
                let path = config
                    .download_dir
                    .join(dir)
                    .to_str()
                    .expect("Non utf-8 path")
                    .to_owned();
                let arg = qb::AddTorrentArg::builder()
                    .source(qb::TorrentSource::Urls {
                        urls: vec![url].into(),
                    })
                    .savepath(path)
                    .build();
                client.add_torrent(arg).await?.into_iter().for_each(|v| {
                    let hash = v.hash;
                    factory.send_after(Duration::SECOND * 5, move || {
                        FactoryMessage::Dispatch(Job {
                            key: job_key,
                            msg: DownloadWorkerMessage::Rename(
                                hash.clone()
                                    .expect("Qbittorrent did not return torrent hash"),
                            ),
                            options: JobOptions::default(),
                        })
                    });
                });
            }
            Client::Transmission((client, config)) => {
                let arg = tr::TorrentAddArgs {
                    filename: Some(url.to_string()),
                    download_dir: Some(
                        config
                            .download_dir
                            .join(dir)
                            .to_str()
                            .expect("Non utf-8 path")
                            .to_owned(),
                    ),
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
                        key: job_key,
                        msg: DownloadWorkerMessage::Rename(trans_id_to_string(id.clone())),
                        options: JobOptions::default(),
                    })
                });
            }
        }
        Ok(())
    }

    async fn rename(&self, id: String) -> Result<(), ActorProcessingErr> {
        match self.client.deref() {
            Client::Qbit((client, _)) => {
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
            }
            Client::Transmission((client, _)) => {
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
                        self.rename(id).await?;
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

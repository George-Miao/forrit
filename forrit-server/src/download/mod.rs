use std::sync::Arc;

use color_eyre::Result;
use forrit_core::Job as ForritJob;
use qbit_rs::{model::Credential, Qbit};
use ractor::{
    factory::{Factory, FactoryMessage, Job, JobOptions, WorkerMessage, WorkerStartContext},
    registry, Actor, ActorCell, ActorName, ActorRef, MessagingErr,
};
use tap::Pipe;
use transmission_rpc::{types::BasicAuth, SharableTransClient};

use crate::{
    new_factory, DownloadersConfig, Id, QbittorrentConfig, TransmissionConfig,
    WorkerBuilderClosure, HTTP_CLIENT,
};

mod_use::mod_use![qbittorrent, transmission];

pub fn new_job(key: Id, job: ForritJob) -> Result<(), MessagingErr> {
    let msg = FactoryMessage::Dispatch(Job {
        key,
        msg: DownloadWorkerMessage::Job(job),
        options: JobOptions::default(),
    });
    let downloader = registry::where_is("downloader".to_owned()).expect("downloader not running");

    downloader.send_message::<Factory<_, _, QbitWorker>>()
}

struct WorkerChain<T> (ActorCell);

impl WorkerChain {
    pub fn where_is(name: impl Into<ActorName>) -> Option<Self> {
        registry::where_is(name.into()).map(Self)
    }

    pub fn chain<T>()
}

// #[derive(Clone)]
// enum Client {
//     Qbit(Arc<(Qbit, QbittorrentConfig)>),
//     Transmission(Arc<(SharableTransClient, TransmissionConfig)>),
// }

// impl Client {
//     pub fn new(config: DownloadersConfig) -> Self {
//         match config {
//             DownloadersConfig::Transmission(config) => {
//                 let mut client =
// transmission_rpc::SharableTransClient::new_with_client(
// config.url.clone(),                     HTTP_CLIENT.clone(),
//                 );
//                 if let Some(auth) = config.auth.clone() {
//                     client.set_auth(BasicAuth {
//                         user: auth.username,
//                         password: auth.password,
//                     });
//                 }
//                 Self::Transmission(Arc::new((client, config)))
//             }
//             DownloadersConfig::Qbittorrent(config) => {
//                 let client = Qbit::new_with_client(
//                     config.url.clone(),
//                     Credential::new(
//                         config.auth.username.to_owned(),
//                         config.auth.password.to_owned(),
//                     ),
//                     HTTP_CLIENT.clone(),
//                 );
//                 Self::Qbit(Arc::new((client, config)))
//             }
//         }
//     }
// }

// pub struct DownloaderCluster(Client);

// impl DownloaderCluster {
//     pub fn new(config: DownloadersConfig) -> Self {
//         Self(Arc::new(Client::new(config)))
//     }

//     pub async fn spawn(self) -> Result<()> {
//         let factory = new_factory();
//         let builder = WorkerBuilderClosure::new(move |id| match
// self.0.clone() {             Client::Qbit(inner) => QbitWorker { inner, id },
//             Client::Transmission(inner) => TransmissionWorker { inner, id },
//         })
//         .boxed();

//         Actor::spawn(Some("downloader".to_owned()), factory, builder).await?;

//         Ok(())
//     }
// }

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DownloadWorkerMessage {
    Job(ForritJob),
    Rename(Option<String>, u8),
}

pub struct DownloadWorkerState<W>
where
    W: Actor<
        Msg = WorkerMessage<Id, DownloadWorkerMessage>,
        State = DownloadWorkerState<W>,
        Arguments = WorkerStartContext<Id, DownloadWorkerMessage, W>,
    >,
{
    factory: ActorRef<Factory<Id, DownloadWorkerMessage, W>>,
}

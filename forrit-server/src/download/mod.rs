use forrit_core::Job as ForritJob;
use ractor::{
    factory::{Factory, FactoryMessage, Job, JobOptions, WorkerMessage, WorkerStartContext},
    registry, Actor, ActorRef, MessagingErr,
};

use crate::Id;

mod_use::mod_use![qbittorrent, transmission];

pub fn new_job(key: Id, job: ForritJob) -> Result<(), MessagingErr> {
    let downloader = registry::where_is("downloader".to_owned()).expect("downloader not running");

    // Actor type passed on here doesn't really matters -- the only thing matters is
    // the message type. So no matter what worker is actually processing the
    // download job, we can always use `TransmissionWorker` here.
    downloader.send_message::<Factory<_, _, TransmissionWorker>>(FactoryMessage::Dispatch(Job {
        key,
        msg: DownloadWorkerMessage::Job(job),
        options: JobOptions::default(),
    }))
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DownloadWorkerMessage {
    Job(ForritJob),
    /// (id, retry_count)
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

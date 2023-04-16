use std::path::PathBuf;

use bangumi::{
    endpoints::{FetchTags, SearchTorrents},
    rustify::{errors::ClientError, Client},
    Endpoint,
};
use forrit_core::{BangumiSubscription, Job as ForritJob};
use mongodb::{bson::oid::ObjectId, Collection, Database};
use ractor::{
    concurrency::tokio_primatives::sleep,
    factory::{Factory, FactoryMessage, Job, WorkerId, WorkerMessage, WorkerStartContext},
    Actor, ActorProcessingErr, ActorRef, BytesConvertable, Message,
};
use tap::{Pipe, TapFallible};
use tracing::{debug, warn};
use url::Url;

pub struct SourceCluster {
    db: Collection<BangumiSubscription>,
}

impl SourceCluster {
    pub fn new(db: Database) -> Self {
        todo!()
    }
}

enum SourceWorkerMessage {
    Update(BangumiSubscription),
}

impl Message for SourceWorkerMessage {}

struct Worker {
    bangumi: Client,
    id: WorkerId,
}

#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Eq, Ord, Hash)]
pub struct Id(ObjectId);

impl BytesConvertable for Id {
    fn from_bytes(bytes: Vec<u8>) -> Self {
        Self(ObjectId::from_bytes(bytes[..12].try_into().unwrap()))
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.bytes().to_vec()
    }
}

pub struct WorkerState {
    factory: ActorRef<Factory<Id, SourceWorkerMessage, Worker>>,
}

#[async_trait::async_trait]
impl Actor for Worker {
    type Arguments = WorkerStartContext<Id, SourceWorkerMessage, Self>;
    type Msg = WorkerMessage<Id, SourceWorkerMessage>;
    type State = WorkerState;

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        arg: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(WorkerState {
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
                    SourceWorkerMessage::Update(sub) => {
                        let jobs = self.update(&sub).await?;
                        // TODO
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

impl Worker {
    async fn update(&self, sub: &BangumiSubscription) -> Result<Vec<ForritJob>, ClientError> {
        let torrents = SearchTorrents::builder()
            .tags(sub.tags().map(|x| x.0.to_owned()).collect::<Vec<_>>())
            .build()
            .exec(&self.bangumi)
            .await?
            .parse()?
            .torrents;

        let name = sub.dir.as_ref().unwrap_or(&sub.bangumi.name);
        let season = sub.season.unwrap_or(1);
        let dir = PathBuf::from(format!("{name}/S{season}"));

        debug!(?torrents);

        let jobs = torrents
            .into_iter()
            .filter_map(|torrent| {
                let id = torrent.id;
                let filename = torrent.title;

                let url = Url::parse(&torrent.magnet)
                    .tap_err(|error| {
                        warn!(
                            ?error,
                            "Excluded because failed to parse url ({})", torrent.magnet
                        )
                    })
                    .ok()?;

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&filename) {
                        debug!(filename, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&filename) {
                        debug!(filename, "Excluded because include pattern does not match");
                        None?
                }

                Some(ForritJob {
                    id: id.0,
                    url,
                    dir: dir.clone(),
                })
            })
            .collect();

        Ok(jobs)
    }

    pub async fn validate(&self, sub: &BangumiSubscription) -> Result<bool, ClientError> {
        sub.tags()
            .map(|x| x.0.to_owned())
            .collect::<Vec<_>>()
            .pipe(|tags| FetchTags::builder().ids(tags))
            .build()
            .exec(&self.bangumi)
            .await?
            .parse()
            .is_ok()
            .pipe(Ok)
    }
}

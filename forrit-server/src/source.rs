use std::{path::PathBuf, time::Duration};

use bangumi::{
    endpoints::SearchTorrents,
    rustify::{errors::ClientError, Client},
    Endpoint, Torrent,
};
use color_eyre::Result;
use forrit_core::{
    futures::{future::Either, stream, StreamExt, TryStreamExt},
    BangumiSubscription, Job as ForritJob,
};
use mongodb::{
    bson::{doc, DateTime},
    options::UpdateOptions,
    Collection,
};
use ractor::{
    concurrency::JoinHandle,
    factory::{
        Factory, FactoryMessage, Job, JobOptions, WorkerBuilder, WorkerId, WorkerMessage,
        WorkerStartContext,
    },
    registry, Actor, ActorProcessingErr, ActorRef,
};
use serde::{Deserialize, Serialize};
use stream_throttle::{ThrottlePool, ThrottleRate, ThrottledStream};
use tap::{Pipe, TapFallible};
use url::Url;

use crate::{get_config, new_factory, new_job, DownloadWorkerMessage, Id, WithId, BANGUMI_CLIENT};

pub fn update() {
    if let Some(source) = registry::where_is("source".to_owned()) {
        drop(source.send_message::<SourceCluster>(SourceMessage::Update));
    }
}

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum SourceMessage {
    Update,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Record {
    id: bangumi::Id,
    title: String,
    magnet: String,
    seen: DateTime,
}

pub struct SourceCluster {
    col: Collection<WithId<BangumiSubscription>>,
    torrent: Collection<Record>,
    throttle: Option<ThrottlePool>,
}

impl SourceCluster {
    pub fn new(col: Collection<WithId<BangumiSubscription>>, torrent: Collection<Record>) -> Self {
        let throttle = get_config()
            .rate_limit
            .map(|count| ThrottlePool::new(ThrottleRate::new(count, Duration::from_secs(60))));
        Self {
            col,
            torrent,
            throttle,
        }
    }

    pub async fn spawn(self) -> Result<(ActorRef<Self>, JoinHandle<()>)> {
        let factory = new_factory();
        let builder = self.worker_builder();

        Actor::spawn(Some("source_worker".to_owned()), factory, builder).await?;
        Actor::spawn(Some("source".to_owned()), self, ())
            .await
            .map_err(Into::into)
    }

    fn worker_builder(&self) -> Box<dyn WorkerBuilder<SourceWorker>> {
        struct SourceWorkerBuilder {
            client: Client,
            torrent: Collection<Record>,
        }

        impl WorkerBuilder<SourceWorker> for SourceWorkerBuilder {
            fn build(&self, id: WorkerId) -> SourceWorker {
                SourceWorker {
                    id,
                    torrent: self.torrent.clone(),
                    client: self.client.clone(),
                }
            }
        }

        Box::new(SourceWorkerBuilder {
            torrent: self.torrent.clone(),
            client: BANGUMI_CLIENT.clone(),
        })
    }
}

#[async_trait::async_trait]
impl Actor for SourceCluster {
    type Arguments = ();
    type Msg = SourceMessage;
    type State = ();

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        _: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(())
    }

    async fn post_start(
        &self,
        _: ActorRef<Self>,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        info!("Source controller started");
        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self>,
        msg: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            SourceMessage::Update => {
                debug!("Update");

                let downloader = ractor::registry::where_is("source_worker".to_owned())
                    .expect("`source_worker` not found");
                self.col
                    .find(None, None)
                    .await?
                    .map_err(Into::into)
                    .pipe(|x| {
                        if let Some(throttle) = self.throttle.clone() {
                            x.throttle(throttle).pipe(Either::Left)
                        } else {
                            x.pipe(Either::Right)
                        }
                    })
                    .try_for_each(|entry| async {
                        let entry = entry;
                        let WithId { id, inner } = entry;
                        downloader.send_message::<Factory<_, _, SourceWorker>>(
                            FactoryMessage::Dispatch(Job {
                                key: id,
                                msg: SourceWorkerMessage::Update((id, inner)),
                                options: JobOptions::default(),
                            }),
                        )?;

                        Result::<_>::Ok(())
                    })
                    .await?;
            }
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum SourceWorkerMessage {
    Update((Id, BangumiSubscription)),
}

struct SourceWorker {
    client: Client,
    id: WorkerId,
    torrent: Collection<Record>,
}

impl SourceWorker {
    async fn update(&self, sub: &BangumiSubscription) -> Result<Vec<ForritJob>, ClientError> {
        let torrents = SearchTorrents::builder()
            .tags(sub.tags().map(|x| x.0.to_owned()).collect::<Vec<_>>())
            .build()
            .exec(&self.client)
            .await?
            .parse()?
            .torrents;

        let name = sub.dir.as_ref().unwrap_or(&sub.bangumi.name);
        let season = sub.season.unwrap_or(1);
        let dir = PathBuf::from(format!("{name}/S{season}"));

        trace!(?torrents);

        let jobs = stream::iter(torrents)
            .filter_map(|torrent| async {
                let Torrent {
                    id, title, magnet, ..
                } = torrent;

                if self
                    .torrent
                    .update_one(
                        doc! { "id": &id.0 },
                        doc! {
                            "$currentDate": {
                                "seen": true
                            },
                            "$set": {
                                "id": &id.0,
                                "title": &title,
                                "magnet": &magnet
                            }
                        },
                        UpdateOptions::builder().upsert(true).build(),
                    )
                    .await
                    .expect("Database error")
                    .matched_count
                    != 0
                {
                    debug!(title, "Excluded because already seen");
                    None?
                }

                let url = Url::parse(&magnet)
                    .tap_err(|error| {
                        warn!(
                            ?error,
                            %magnet,
                            "Excluded because failed to parse url",
                        )
                    })
                    .ok()?;

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&title) {
                        debug!(title, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&title) {
                        debug!(title, "Excluded because include pattern does not match");
                        None?
                }

                Some(ForritJob {
                    id: id.0,
                    url,
                    dir: dir.clone(),
                })
            })
            .collect()
            .await;

        Ok(jobs)
    }
}

pub struct SourceWorkerState {
    factory: ActorRef<Factory<Id, SourceWorkerMessage, SourceWorker>>,
}

#[async_trait::async_trait]
impl Actor for SourceWorker {
    type Arguments = WorkerStartContext<Id, SourceWorkerMessage, Self>;
    type Msg = WorkerMessage<Id, SourceWorkerMessage>;
    type State = SourceWorkerState;

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        arg: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(SourceWorkerState {
            factory: arg.factory,
        })
    }

    async fn post_start(
        &self,
        _: ActorRef<Self>,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        info!("Source worker #{} started", self.id);
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
                    SourceWorkerMessage::Update((key, sub)) => {
                        for job in self.update(&sub).await? {
                            new_job(key, job)?;
                        }
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

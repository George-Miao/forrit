use bangumi_data::{Item, ItemType};
use chrono::{DateTime, Local};
use forrit_core::IntoStream;
use futures::StreamExt;
use tap::Pipe;
use tokio::sync::watch::{self, error::RecvError, Receiver, Sender};
use tracing::{debug, info, instrument, trace};

use crate::{
    resolver::{meta::Meta, Resolver},
    util::{DateExt, YearMonth},
};

#[derive(Debug, Clone, Default, Copy, PartialEq, Eq)]
pub struct IndexArg {
    pub force: bool,
    pub max: Option<usize>,
    pub after: Option<YearMonth>,
    pub before: Option<YearMonth>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct IndexStat {
    /// Indexing argument
    pub arg: IndexArg,

    /// Number of items from bangumi data
    pub num_items: u32,

    /// Number of items filtered out
    pub num_filtered: u32,

    /// Number of new items added
    pub num_new: u32,

    /// Number of updated items. Only update when force is set to true.
    pub num_updated: u32,

    /// Number of items unchanged.
    pub num_unchanged: u32,

    /// Time when the indexing started
    pub start_at: DateTime<Local>,

    /// Time when the indexing ended
    pub end_at: Option<DateTime<Local>>,
}

impl IndexStat {
    pub fn new(arg: IndexArg) -> Self {
        Self {
            arg,
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum IndexResult {
    New,
    Updated,
    Unchanged,
}

pub struct IndexJob {
    rx: IndexStatRecv,
    handle: tokio::task::JoinHandle<()>,
}

impl IndexJob {
    /// Wait for the index job to finish
    pub async fn wait(self) {
        self.handle.await.expect("Index job panicked");
    }

    /// Stop the index job immediately
    pub fn stop(self) {
        self.handle.abort();
    }

    pub fn stat_recv(&self) -> IndexStatRecv {
        self.rx.clone()
    }

    pub fn current_stat(&self) -> IndexStat {
        self.rx.snapshot()
    }
}

#[derive(Debug, Clone)]
pub struct IndexStatRecv(Receiver<IndexStat>);

impl IndexStatRecv {
    /// Wait for the index stat to change and return the new stat
    pub async fn changes(&mut self) -> Result<IndexStat, RecvError> {
        self.0.changed().await?;
        (*self.0.borrow_and_update()).pipe(Ok)
    }

    /// Get the current index stat
    pub fn current(&mut self) -> IndexStat {
        *self.0.borrow_and_update()
    }

    pub fn snapshot(&self) -> IndexStat {
        *self.0.borrow()
    }
}

impl Resolver {
    // TODO: Transactional and unique indexing
    pub fn index_job(self, arg: IndexArg) -> IndexJob {
        let (tx, rx) = watch::channel(IndexStat::new(arg));
        let handle = tokio::spawn(async move { self.index(tx, arg).await });
        IndexJob {
            rx: IndexStatRecv(rx),
            handle,
        }
    }

    async fn index(&self, stat: Sender<IndexStat>, arg: IndexArg) {
        info!("Indexing");
        stat.send_modify(|x| x.start_at = Local::now());
        let data = bangumi_data::get_all().await.expect("Failed to get bangumi data").items;
        stat.send_modify(|x| x.num_items = data.len() as u32);

        data.into_iter()
            .filter(|item| {
                if item.item_type != ItemType::TV {
                    return false;
                }
                let Some(date) = item.begin else {
                    return true;
                };
                if let Some(after) = arg.after {
                    if date.date.yearmonth() < after {
                        stat.send_modify(|x| x.num_filtered += 1);
                        return false;
                    }
                }
                if let Some(before) = arg.before {
                    if date.date.yearmonth() > before {
                        stat.send_modify(|x| x.num_filtered += 1);
                        return false;
                    }
                }
                true
            })
            .into_stream()
            .for_each_concurrent(None, |item| async {
                let res = self.index_one(arg.force, item).await;
                stat.send_modify(|x| match res {
                    IndexResult::New => x.num_new += 1,
                    IndexResult::Updated => x.num_updated += 1,
                    IndexResult::Unchanged => x.num_unchanged += 1,
                });
            })
            .await;
        stat.send_modify(|x| x.end_at = Some(Local::now()));
        info!(state = ?stat.borrow(), "Indexing finished");
    }

    /// Index one item
    #[instrument(name = "index", target = "resolver", fields(title = item.title), skip(self, item))]
    async fn index_one(&self, force: bool, item: Item) -> IndexResult {
        trace!(?item);
        let exist = self.meta.get(&item.title).await.expect("db error").is_some();
        debug!(?exist);
        // Skip if already indexed
        if exist && !force {
            return IndexResult::Unchanged;
        }
        let result = self.match_item(&item).await;
        debug!(?result, "Item matched");
        let meta = Meta::new(item, result.tv, result.season);
        self.meta.upsert(meta).await.expect("db error");
        debug!("Meta inserted");

        if exist { IndexResult::Updated } else { IndexResult::New }
    }
}

#[cfg(test)]
mod test {
    use crate::{resolver::index::IndexArg, test::run, util::YearMonth};

    #[test]
    fn test_index() {
        run(|env| async move {
            let handle = env.resolver.clone().index_job(IndexArg {
                force: true,
                max: None,
                after: YearMonth::new(2020, 1).into(),
                before: None,
            });

            let mut recv = handle.stat_recv();

            loop {
                let Ok(_) = recv.changes().await else { break };
            }
        })
    }
}

use bangumi_data::{Item, ItemType};
use chrono::Utc;
use forrit_core::{
    DateExt, IntoStream,
};
use futures::StreamExt;
use salvo::oapi::ToSchema;
use serde::{Deserialize, Serialize};
use tokio::sync::watch::{self, error::RecvError, Receiver, Sender};
use tracing::{debug, info, instrument, trace};

use crate::{
    resolver::Resolver,
    util::{DateExt, YearMonth},
};

#[derive(Debug, Clone, Default, Copy, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct IndexArg {
    /// Force re-indexing even if the item already exists
    #[serde(default)]
    pub force: bool,

    /// Maximum number of items to index
    #[serde(default)]
    pub max: Option<usize>,

    /// Only index items after this date
    #[serde(default)]
    pub after: Option<YearMonth>,

    /// Only index items before this date
    #[serde(default)]
    pub before: Option<YearMonth>,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, ToSchema)]
pub struct IndexStat {
    /// Indexing argument
    pub arg: IndexArg,

    /// Number of items from bangumi data
    pub num_items: u32,

    /// Number of non-TV items
    pub num_non_tv: u32,

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
    #[cfg(test)]
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
    pub async fn wait(&mut self) -> Result<IndexStat, RecvError> {
        self.0.changed().await?;
        Ok(self.current())
    }

    /// Get the current index stat. This will mark the stat as read and will not
    /// be seen again when using [`Self::wait`].
    pub fn current(&mut self) -> IndexStat {
        *self.0.borrow_and_update()
    }

    /// Get the current index stat without marking it as read, so that
    /// [`Self::wait`] will still return it.
    pub fn snapshot(&self) -> IndexStat {
        *self.0.borrow()
    }
}

impl Resolver {
    // TODO: Transactional indexing
    pub fn index_job(self, arg: IndexArg) -> IndexJob {
        let (tx, rx) = watch::channel(IndexStat::new(arg));
        let handle = tokio::spawn(async move {
            self.index(tx, arg).await;
            super::index_finished()
        });
        // let handle = tokio::spawn(async move {});
        IndexJob {
            rx: IndexStatRecv(rx),
            handle,
        }
    }

    #[instrument(skip(self, stat))]
    async fn index(&self, stat: Sender<IndexStat>, arg: IndexArg) {
        info!(?arg, "Indexing");

        stat.send_modify(|x| x.start_at = Utc::now());
        let data = bangumi_data::get_all().await.expect("Failed to get bangumi data").items;
        stat.send_modify(|x| x.num_items = data.len() as u32);

        data.into_iter()
            .filter(|item| {
                if item.item_type != ItemType::TV {
                    stat.send_modify(|x| x.num_non_tv += 1);
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

        stat.send_modify(|x| x.end_at = Some(Utc::now()));
        info!(stat = ?*stat.borrow(), "Indexing finished");
    }

    /// Index one item
    #[instrument(fields(title = item.title), skip(self, item))]
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
        self.meta.upsert(&meta).await.expect("db error");
        if exist { IndexResult::Updated } else { IndexResult::New }
    }
}

#[cfg(test)]
mod test {
    use forrit_core::model::YearMonth;
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
                let Ok(_) = recv.wait().await else { break };
            }
        })
    }
}

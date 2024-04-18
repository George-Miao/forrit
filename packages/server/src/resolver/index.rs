use bangumi_data::{Item, ItemType};
use chrono::Utc;
use forrit_core::{
    model::{IndexArg, IndexStat, Meta},
    DateExt, IntoStream,
};
use futures::StreamExt;
use tokio::sync::watch::{self, error::RecvError, Receiver, Sender};
use tracing::{debug, info, instrument, trace};

use crate::resolver::Resolver;

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
        let exist = self.meta.get_by_title(&item.title).await.expect("db error").is_some();
        debug!(?exist);
        // Skip if already indexed
        if exist && !force {
            return IndexResult::Unchanged;
        }
        let result = self.match_item(&item).await;
        debug!(?result, "Item matched");
        let meta = Meta::new(item, result.tv, result.season);
        self.meta.upsert(&meta.into()).await.expect("db error");
        if exist { IndexResult::Updated } else { IndexResult::New }
    }
}

#[cfg(test)]
mod test {
    use forrit_core::date::YearMonth;

    use crate::{resolver::index::IndexArg, test::run};

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

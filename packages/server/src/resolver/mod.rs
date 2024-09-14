//! Resolver module
//!
//! Extract and match episode info from given torrent and filename

use std::{cell::RefCell, ops::Deref, sync::Arc};

use anitomy::{Anitomy, ElementCategory, Elements};
use bangumi_data::Item;
use chrono::Days;
use forrit_config::{get_config, ResolverConfig};
use forrit_core::{
    date::YearSeason,
    model::{IndexArg, Meta, WithId},
};
use futures::Future;
use governor::{Quota, RateLimiter};
// use color_eyre::eyre::Result;
use mongodb::bson::oid::ObjectId;
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef, RpcReplyPort};
use tap::{Pipe, TapFallible, TapOptional};
use tmdb_api::tvshow::{search::TVShowSearch, SeasonShort, TVShowShort};
use tracing::{debug, info, instrument, trace};

use crate::{
    db::{Collections, KV},
    resolver::{
        index::{IndexJob, IndexStatRecv},
        util::StrExt,
    },
    util::{Boom, CommandExt, GovernedClient},
    REQ,
};

mod api;
mod call;
mod index;
mod meta;
mod util;

pub use api::resolver_api;
pub use call::*;
pub use meta::MetaStorage;

pub type Datetime = chrono::DateTime<chrono::FixedOffset>;
pub type AliasKV = KV<String, ObjectId>;

/// Genre ID for animation on TMDB
///
/// See: https://www.themoviedb.org/genre/16-animation
const ANIME_GENRE: u64 = 16;

pub async fn start(db: &Collections) {
    let config = &get_config().resolver;
    let client = GovernedClient::new(
        tmdb_api::Client::builder()
            .with_api_key(config.tmdb_api_key.clone())
            .with_base_url("https://api.themoviedb.org/3")
            .with_reqwest_client(REQ.clone())
            .build()
            .boom("Failed to init TMDB client"),
        RateLimiter::direct(Quota::per_second(config.tmdb_rate_limit)),
    );

    let resolver = Resolver::new(client, db.meta.clone(), db.alias.clone(), config);
    Actor::spawn(Some(Resolver::NAME.to_owned()), resolver, ())
        .await
        .boom("Failed to spawn resolver actor");
}

#[derive(Debug, Clone, PartialEq, Default)]
pub struct MatchResult {
    pub tv: Option<TVShowShort>,
    pub season: Option<SeasonShort>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ExtractResult {
    pub meta: Option<WithId<Meta>>,
    pub group: Option<String>,
    pub elements: Elements,
}

#[derive(Debug)]
pub enum Message {
    /// Resolve file name and match it to a meta entry.
    Resolve {
        file_name: String,
        port: RpcReplyPort<ExtractResult>,
    },

    /// Start an index job
    StartIndexJob {
        arg: IndexArg,
        port: Option<RpcReplyPort<IndexStatRecv>>,
    },

    /// Get current index job
    GetIndexJob(RpcReplyPort<Option<IndexStatRecv>>),

    /// Stop current index job
    StopIndexJob,

    /// Index job finished, used for internal communication
    IndexJobFinished,

    /// Get bangumi's of current season
    GetBySeason {
        season: Option<YearSeason>,
        port: RpcReplyPort<Vec<WithId<Meta>>>,
    },

    /// Get meta by id
    GetOne {
        id: ObjectId,
        port: RpcReplyPort<Option<WithId<Meta>>>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SearchArg<'a> {
    title: &'a str,
    begin: Option<Datetime>,
    end: Option<Datetime>,
}

enum SearchRes {
    Decided(Option<TVShowShort>),
    Undecided,
}

pub struct ResolverInner {
    tmdb: GovernedClient,
    alias: AliasKV,
    meta: MetaStorage,
    config: &'static ResolverConfig,
}

#[derive(Clone)]
pub struct Resolver(Arc<ResolverInner>);

impl Deref for Resolver {
    type Target = ResolverInner;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Resolver {
    pub const NAME: &'static str = "resolve";

    pub fn new(tmdb: GovernedClient, meta: MetaStorage, alias: AliasKV, config: &'static ResolverConfig) -> Self {
        Self(Arc::new(ResolverInner {
            tmdb,
            meta,
            alias,
            config,
        }))
    }

    fn dispatch<F, Fut>(&self, f: F)
    where
        F: FnOnce(Resolver) -> Fut,
        Fut: Future + Send + 'static,
        Fut::Output: Send + 'static,
    {
        tokio::spawn(f(self.clone()));
    }
}

impl ResolverInner {
    /// Parse filename into elements with anitomy
    fn parse_filename(&self, file_name: &str) -> Elements {
        thread_local! {
            static ANITOMY: RefCell<Anitomy> = RefCell::new(Anitomy::new());
        }

        ANITOMY
            .with(|anitomy| anitomy.borrow_mut().parse(file_name))
            .unwrap_or_else(|e| {
                debug!(file_name, "failed to parse filename");
                e
            })
    }

    #[instrument(skip(self, item), fields(title = item.title))]
    async fn match_item(&self, item: &Item) -> MatchResult {
        let arg = SearchArg {
            title: &item.title,
            begin: item.begin.as_ref().and_then(|x| x.into_fixed_offset()),
            end: item.end.as_ref().and_then(|x| x.into_fixed_offset()),
        };
        let Some(tv) = self.search(arg).await else {
            return Default::default();
        };
        debug!(id = tv.inner.id, name = tv.inner.original_name, "TV show found");
        let season = tmdb_api::tvshow::details::TVShowDetails::new(tv.inner.id)
            .execute_with_governor(&self.tmdb)
            .await
            .tap_err(|_| tracing::error!(id = tv.inner.id, "BOOM"))
            .expect("Failed to get tv show details") // TODO: add backoff
            .seasons
            .into_iter()
            .find_map(|season| {
                let air_date = season.inner.air_date?;

                // IMDB adds a "Specials" season to shows for things like SPs and OVAs. It
                // starts at the same time as the show. We don't want it to
                // mock the actual first season.
                if season.inner.name == "Specials" {
                    debug!("Specials season, ignore");
                    return None;
                }
                if let Some(begin) = arg.begin {
                    // Before or after 14 days of begin date
                    if 14 < begin.date_naive().signed_duration_since(air_date).num_days().abs() {
                        debug!(bangumi_data = %begin.date_naive(), tmdb = %air_date, "Too far from begin date, ignore");
                        return None;
                    }
                }
                if let Some(end) = arg.end {
                    // Air after 14 days after end date
                    if air_date > end.date_naive().checked_add_days(Days::new(14)).unwrap() {
                        debug!("After end date, ignore");
                        return None;
                    }
                }

                Some(season)
            });

        MatchResult { tv: Some(tv), season }
    }

    #[instrument(skip(self, arg), fields(title = arg.title))]
    pub async fn search(&self, arg: SearchArg<'_>) -> Option<TVShowShort> {
        for cut in 0.. {
            match self.try_search(&arg, cut).await {
                SearchRes::Decided(None) => {
                    break;
                }
                SearchRes::Decided(Some(res)) => return Some(res),
                SearchRes::Undecided => {}
            }
        }

        None
    }

    #[instrument(skip(self, arg), fields(title = arg.title))]
    async fn try_search(&self, arg: &SearchArg<'_>, cut: usize) -> SearchRes {
        let t = match arg.title.cut(cut) {
            Some(t) => t.remove_postfix(),
            None => {
                debug!("not found");
                return SearchRes::Decided(None);
            }
        };

        if t != arg.title {
            debug!(from = arg.title, to = t, "Title cut")
        } else {
            debug!("try search")
        }

        let res = TVShowSearch::new(t.to_owned())
            .with_include_adult(true)
            .with_language(Some("zh".to_owned()))
            .execute_with_governor(&self.tmdb)
            .await
            .expect("Failed to search on TMDB")
            .results
            .into_iter()
            .find(|show| show.genre_ids.contains(&ANIME_GENRE));

        if let Some(res) = res {
            debug!(?res, "found");
            SearchRes::Decided(Some(res))
        } else {
            trace!("undecided");
            SearchRes::Undecided
        }
    }

    async fn locate_meta(&self, tmdb_id: u64) -> Option<WithId<Meta>> {
        self.meta
            .get_latest(tmdb_id)
            .await
            .expect("db error")
            .tap_none(|| debug!(tmdb_id, "failed to locate meta"))
    }

    #[instrument(skip(self))]
    async fn resolve(&self, filename: &str) -> ExtractResult {
        let mut titles = filename.match_title().map(|(l, r)| vec![l, r]).unwrap_or_default();
        let elements = self.parse_filename(filename);
        if let Some(title) = elements.get(ElementCategory::AnimeTitle) {
            titles.push(title)
        };
        let group = elements.get(ElementCategory::ReleaseGroup).map(ToOwned::to_owned);
        debug!(?titles, ?group);

        for title in titles {
            let title = title.to_owned();
            if let Some(id) = self.alias.get(&title).await.expect("db error") {
                // Search alias first
                debug!(title, ?id, "Alias found");
                let meta = self.meta.get_by_oid(id).await.expect("db error");
                if meta.is_none() {
                    debug!("Alias target is missing, removing alias");
                    self.alias.delete(&title).await.expect("db error");
                } else {
                    return ExtractResult { group, meta, elements };
                }
            }
            if !title.is_mostly_ascii() {
                // If it's not mostly ascii, search database
                if let Some(meta) = self.meta.text_search(title.remove_postfix()).await.expect("db error") {
                    debug!(title, "Mongo text search found");
                    if let Some(end) = meta.end
                        && end < chrono::Utc::now()
                    {
                        debug!(title, "Found meta is outdated");
                        continue;
                    }
                    self.alias.upsert(&title, &meta.id).await.expect("db error");
                    return ExtractResult {
                        group,
                        meta: Some(meta),
                        elements,
                    };
                }
            } else if let Some(m) = try {
                // Search tmdb
                let arg = SearchArg {
                    title: &title,
                    begin: None,
                    end: None,
                };
                let found = self.search(arg).await?;
                let meta = self.locate_meta(found.inner.id).await?;
                self.alias.upsert(&title, &meta.id).await.expect("db error");
                debug!(title, "TMDB search found");
                meta
            } {
                return ExtractResult {
                    group,
                    meta: Some(m),
                    elements,
                };
            };
        }

        debug!("No meta matched");

        ExtractResult {
            group,
            meta: None,
            elements,
        }
    }
}

pub struct State {
    index_job: Option<IndexJob>,
    index_timer: Option<JoinHandle<()>>,
}

impl Actor for Resolver {
    type Arguments = ();
    type Msg = Message;
    type State = State;

    async fn pre_start(
        &self,
        this: ActorRef<Self::Msg>,
        _: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        info!("Resolver starting");

        let index_timer = if self.config.index.enable {
            let arg = IndexArg::default();
            let interval = humantime::format_duration(self.config.index.interval);
            if self.config.index.start_at_begin {
                this.send_message(Message::StartIndexJob { arg, port: None })
                    .expect("Failed to start index job");
            };
            info!(?arg, %interval, "Index timer set");
            ractor::time::send_interval(self.config.index.interval, this.get_cell(), move || {
                Message::StartIndexJob { arg, port: None }
            })
            .pipe(Some)
        } else {
            info!("Index timer disabled");
            None
        };
        Ok(State {
            index_job: None,
            index_timer,
        })
    }

    async fn post_start(&self, _: ActorRef<Self::Msg>, _: &mut Self::State) -> Result<(), ActorProcessingErr> {
        info!("Resolver started");
        Ok(())
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        if let Some(job) = state.index_job.take() {
            job.stop();
        }
        if let Some(timer) = state.index_timer.take() {
            timer.abort();
        }
        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self::Msg>,
        msg: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            Message::Resolve { file_name, port } => {
                // So that resolve won't block other messages
                tokio::spawn({
                    let this = self.clone();
                    async move {
                        port.send(this.resolve(&file_name).await).ok();
                    }
                });
            }
            Message::StartIndexJob { arg, port } => {
                let job = match state.index_job.take() {
                    Some(job) => {
                        if job.current_stat().end_at.is_some() {
                            job.stop();
                            self.clone().index_job(arg)
                        } else {
                            job
                        }
                    }
                    None => self.clone().index_job(arg),
                };
                if let Some(port) = port {
                    port.send(job.stat_recv()).ok();
                }
                state.index_job = Some(job);
            }
            Message::GetIndexJob(port) => {
                port.send(state.index_job.as_ref().map(|j| j.stat_recv())).ok();
            }
            Message::StopIndexJob => {
                info!("Stopping index job");
                if let Some(j) = state.index_job.take() {
                    j.stop()
                }
            }
            Message::IndexJobFinished => {
                if let Some(j) = state.index_job.take() {
                    j.stop()
                }
            }
            Message::GetBySeason { season, port } => self.dispatch(|this| async move {
                let meta = this
                    .meta
                    .get_by_season(season.unwrap_or_default())
                    .await
                    .expect("db error");
                port.send(meta).ok();
            }),
            Message::GetOne { id, port } => self.dispatch(|this| async move {
                let meta = this.meta.get_by_oid(id).await.expect("db error");
                port.send(meta).ok();
            }),
        };

        Ok(())
    }
}

#[cfg(test)]
mod test {

    use bangumi_data::get_by_month;
    use tracing::info;

    use crate::test::run;

    // File names with no meta
    #[rustfmt::skip]
    const PROBLEM: &[&str] = &[
        "【喵萌奶茶屋】★02月新番★[忍者神威 / Ninja Kamui][06][1080p][简体][招募翻译]", // bangumi data doesn't have this
        "【極影字幕·毀片黨】北海道辣妹兒賊招人稀罕 第09集 BIG5 AVC 720p" // Just couldn't find it
    ];

    #[test]
    fn test_match() {
        run(|env| async move {
            let a = env
                .resolver
                .resolve(
                    "[LoliHouse] 为美好的世界献上祝福！3 / Kono Subarashii Sekai ni Shukufuku wo! S3 - 01 [WebRip \
                     1080p HEVC-10bit AAC][简繁内封字幕]",
                )
                .await;
            info!(?a);
        })
    }

    #[test]
    fn test_one() {
        run(|env| async move {
            let item = get_by_month(2022, 7)
                .await
                .unwrap()
                .into_iter()
                .find(|x| x.title == "iiiあいすくりん2")
                .unwrap();
            let a = env.resolver.match_item(&item).await;
            info!("{:#?}", a);
        })
    }
}

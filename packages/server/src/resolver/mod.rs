//! Resolver module
//!
//! Extract and match episode info from given torrent and filename

use std::{cell::RefCell, sync::Arc};

use anitomy::{Anitomy, ElementCategory, Elements};
use bangumi_data::Item;
use forrit_core::model::{Alias, Meta, WithId};
use governor::{DefaultDirectRateLimiter, Quota, RateLimiter};
// use color_eyre::eyre::Result;
use mongodb::bson::oid::ObjectId;
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef, RpcReplyPort};
use tap::{Pipe, TapFallible, TapOptional};
use tmdb_api::tvshow::{search::TVShowSearch, SeasonShort, TVShowShort};
use tracing::{debug, info, instrument, trace};

use crate::{
    config::{get_config, ResolverConfig},
    db::{Collections, CrudCall, CrudMessage, FromCrud, KV},
    resolver::{
        index::{IndexArg, IndexJob, IndexStatRecv},
        util::{is_mostly_ascii, match_title_in_filename},
    },
    util::{Boom, CommandExt, GovernedClient},
    ACTOR_ERR, RECV_ERR, REQ, RPC_TIMEOUT, SEND_ERR,
};

mod api;
mod index;
mod meta;
mod util;

pub use api::index_api;
pub use meta::MetaStorage;

pub type Datetime = chrono::DateTime<chrono::FixedOffset>;
pub type AliasKV = KV<String, ObjectId>;

/// Genre ID for animation on TMDB
///
/// See: https://www.themoviedb.org/genre/16-animation
const ANIME_GENRE: u64 = 16;

pub async fn start(db: &Collections) {
    let config = &get_config().resolver;
    let governor: Arc<DefaultDirectRateLimiter> = RateLimiter::direct(Quota::per_second(config.tmdb_rate_limit)).into();
    let client = GovernedClient::new(
        tmdb_api::Client::builder()
            .with_api_key(config.tmdb_api_key.clone())
            .with_base_url("https://api.themoviedb.org/3")
            .with_reqwest_client(REQ.clone())
            .build()
            .boom("Failed to init TMDB client"),
        governor.clone(),
    );

    let resolver = Resolver::new(client, db.meta.clone(), db.alias.clone(), config).await;
    Actor::spawn(Some(Resolver::NAME.to_owned()), resolver, ())
        .await
        .boom("Failed to spawn resolver actor");
}

/// Resolve file name and match it to a meta entry.
pub async fn resolve(file_name: String) -> ExtractResult {
    ractor::registry::where_is(Resolver::NAME.to_owned())
        .as_ref()
        .expect(ACTOR_ERR)
        .pipe(|res| ractor::rpc::call(res, |port| Message::Resolve { file_name, port }, None))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub async fn get_index() -> Option<IndexStatRecv> {
    ractor::registry::where_is(Resolver::NAME.to_owned())
        .as_ref()
        .expect(ACTOR_ERR)
        .pipe(|res| ractor::rpc::call(res, Message::GetIndexJob, Some(RPC_TIMEOUT)))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub async fn start_index(arg: IndexArg) -> IndexStatRecv {
    ractor::registry::where_is(Resolver::NAME.to_owned())
        .as_ref()
        .expect(ACTOR_ERR)
        .pipe(|res| {
            ractor::rpc::call(
                res,
                |port| Message::StartIndexJob { arg, port: Some(port) },
                Some(RPC_TIMEOUT),
            )
        })
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub fn stop_index() {
    ractor::registry::where_is(Resolver::NAME.to_owned())
        .as_ref()
        .expect(ACTOR_ERR)
        .send_message(Message::StopIndexJob)
        .expect(SEND_ERR)
}

fn index_finished() {
    ractor::registry::where_is(Resolver::NAME.to_owned())
        .as_ref()
        .expect(ACTOR_ERR)
        .send_message(Message::IndexJobFinished)
        .expect(SEND_ERR)
}

pub fn crud_meta() -> CrudCall<Meta, Message> {
    CrudCall::new(Resolver::NAME)
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

    /// CRUD operations on meta
    CrudMeta(CrudMessage<Meta>),

    /// CRUD operations on alias
    CrudAlias(CrudMessage<Alias>),
}

impl FromCrud<Meta> for Message {
    const ACTOR_NAME: &'static str = Resolver::NAME;
    const RESOURCE_NAME: &'static str = "meta";

    fn from_crud(msg: CrudMessage<Meta>) -> Self {
        Self::CrudMeta(msg)
    }
}

impl FromCrud<Alias> for Message {
    const ACTOR_NAME: &'static str = Resolver::NAME;
    const RESOURCE_NAME: &'static str = "alias";

    fn from_crud(msg: CrudMessage<Alias>) -> Self {
        Self::CrudAlias(msg)
    }
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

#[derive(Clone)]
pub struct Resolver {
    tmdb: GovernedClient,
    alias: AliasKV,
    meta: MetaStorage,
    config: &'static ResolverConfig,
}

impl Resolver {
    pub const NAME: &'static str = "resolve";

    pub async fn new(tmdb: GovernedClient, meta: MetaStorage, alias: AliasKV, config: &'static ResolverConfig) -> Self {
        Self {
            tmdb,
            meta,
            alias,
            config,
        }
    }

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
                    return None;
                }
                if let Some(begin) = arg.begin {
                    if (begin.naive_utc().date() - air_date).num_days() > 14 {
                        return None;
                    }
                }
                if let Some(end) = arg.end {
                    if (air_date - end.naive_utc().date()).num_days().abs() > 14 {
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
        let t = match util::cut_title(arg.title, cut) {
            Some(t) => util::remove_postfix(t),
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
        let mut titles = match_title_in_filename(filename)
            .map(|(l, r)| vec![l, r])
            .unwrap_or_default();
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
            if !is_mostly_ascii(&title) {
                // If it's not mostly ascii, search database
                if let Some(meta) = self.meta.text_search(&title).await.expect("db error") {
                    debug!(title, "Mongo text search found");
                    self.alias.upsert(&title, &meta.id).await.expect("db error");
                    return ExtractResult {
                        group,
                        meta: Some(meta),
                        elements,
                    };
                }
            } else if let Some(m) = async {
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
                Some(meta)
            }
            .await
            {
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
            info!(?arg, %interval, "Index timer set");
            this.send_message(Message::StartIndexJob { arg, port: None })
                .expect("Failed to start index job");
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
                port.send(self.resolve(&file_name).await).ok();
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
            Message::CrudMeta(msg) => self.meta.handle_crud(msg).await,
            Message::CrudAlias(msg) => self.alias.handle_crud(msg).await,
        };

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use std::{
        str::FromStr,
        time::{Duration, Instant},
    };

    use ractor::Actor;
    use tap::Pipe;
    use tracing::{info, warn};

    use crate::{
        resolver::{crud_meta, index::IndexArg, Resolver},
        test::run,
    };

    // File names with no meta
    #[rustfmt::skip]
    const PROBLEM: &[&str] = &[
        "【喵萌奶茶屋】★02月新番★[忍者神威 / Ninja Kamui][06][1080p][简体][招募翻译]", // bangumi data doesn't have this
        "【極影字幕·毀片黨】北海道辣妹兒賊招人稀罕 第09集 BIG5 AVC 720p" // Just couldn't find it
    ];

    #[test]
    fn test_match() {
        run(|env| async move {
            let a = env.resolver.resolve(PROBLEM[1]).await;
            info!(?a);
        })
    }

    #[test]
    fn test_list_meta_while_index() {
        run(|env| async move {
            let resolver = env.resolver.clone();
            let j_start = Instant::now();
            let _j1 = resolver.index_job(IndexArg::default());
            info!("Index started");
            let (_, _j2) = Actor::spawn(Some(Resolver::NAME.to_owned()), env.resolver.clone(), ())
                .await
                .unwrap();

            tokio::time::sleep(Duration::from_secs(1)).await;

            let l_start = Instant::now();
            info!("List started");
            let l = crud_meta().list().await.unwrap();

            info!(
                "List finished: {}, used {:.2}s",
                l.len(),
                l_start.elapsed().as_secs_f32()
            );
            _j1.wait().await;
            info!("Index finished, used {:.2}s", j_start.elapsed().as_secs_f32());
        })
    }

    #[test]
    fn test_one() {
        run(|env| async move {
            let url = "https://acg.rip/1.xml";
            let t = reqwest::get(url)
                .await
                .unwrap()
                .text()
                .await
                .unwrap()
                .pipe(|b| rss::Channel::from_str(&b))
                .unwrap()
                .items
                .into_iter()
                .filter_map(|x| x.title);
            for title in t {
                let res = env.resolver.resolve(&title).await;
                if let Some(meta) = res.meta {
                    let id = meta.id.to_hex();
                    let matched = &meta.title;
                    info!(title, id, matched);
                } else {
                    warn!(title, "No meta found");
                }
            }
        })
    }
}

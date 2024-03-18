//! Resolver module
//!
//! Extract and match episode info from given torrent and filename

use std::{cell::RefCell, sync::Arc};

use anitomy::{Anitomy, ElementCategory, Elements};
use bangumi_data::Item;
use governor::{DefaultDirectRateLimiter, Quota, RateLimiter};
// use color_eyre::eyre::Result;
use mongodb::{bson::oid::ObjectId, Database};
use ractor::{concurrency::JoinHandle, Actor, ActorProcessingErr, ActorRef, RpcReplyPort};
use reqwest::Client;
use tap::{Pipe, Tap, TapFallible, TapOptional};
use tmdb_api::tvshow::{search::TVShowSearch, SeasonShort, TVShowShort};
use tracing::{debug, info, instrument, warn};

pub use crate::resolver::meta::Meta;
use crate::{
    config::{get_config, ResolverConfig},
    db::{CrudCall, CrudMessage, FromCrud, KVCollection, WithId, KV},
    resolver::{
        index::{IndexArg, IndexJob, IndexStatRecv},
        util::{is_mostly_ascii, match_title_in_filename},
    },
    util::{Boom, CommandExt, GovernedClient},
    ACTOR_ERR, RECV_ERR, REQ, SEND_ERR,
};

mod index;
mod meta;
mod util;

#[cfg(not(test))]
use meta::MetaStorage;
#[cfg(test)]
pub use meta::MetaStorage;

pub type Datetime = chrono::DateTime<chrono::FixedOffset>;
pub type AliasCollection = KVCollection<String, ObjectId>;
pub type AliasKV = KV<String, ObjectId>;

/// Genre ID for animation on TMDB
///
/// See: https://www.themoviedb.org/genre/16-animation
const ANIME_GENRE: u64 = 16;

pub async fn start(db: &Database) {
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
    let meta = MetaStorage::new(db.collection("meta"));
    meta.create_indexes()
        .await
        .boom("Failed to create index for meta storage");
    let resolver = Resolver::new(client, meta, db.collection("aliases"), config).await;
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

pub fn crud_meta() -> CrudCall<Message> {
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

    /// CRUD operations on meta
    CrudMeta(CrudMessage<Meta>),
}

impl FromCrud for Message {
    type Item = Meta;

    fn from_crud(msg: CrudMessage<Meta>) -> Self {
        Self::CrudMeta(msg)
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
    aliases: AliasKV,
    meta: MetaStorage,
    config: &'static ResolverConfig,
}

impl Resolver {
    pub const NAME: &'static str = "resolve";

    pub async fn new(
        tmdb: GovernedClient,
        meta: MetaStorage,
        aliases: AliasCollection,
        config: &'static ResolverConfig,
    ) -> Self {
        Self {
            tmdb,
            meta,
            aliases: KV::new(aliases).await.expect("db error"),
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

    async fn match_item(&self, item: &Item) -> MatchResult {
        let arg = SearchArg {
            title: &item.title,
            begin: item.begin.as_ref().and_then(|x| x.into_fixed_offset()),
            end: item.end.as_ref().and_then(|x| x.into_fixed_offset()),
        };
        // TODO: Search movie
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

    async fn try_search(&self, arg: &SearchArg<'_>, cut: usize) -> SearchRes {
        let t = match util::cut_title(arg.title, cut) {
            Some(t) => util::remove_postfix(t),
            None => return SearchRes::Decided(None),
        };

        if t != arg.title {
            debug!(from = arg.title, to = t, "Title cut")
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
            SearchRes::Decided(Some(res))
        } else {
            SearchRes::Undecided
        }
    }

    /// Search for a TV show given elements parsed from torrent filename
    async fn search_element(&self, ele: &Elements) -> Option<TVShowShort> {
        ele.get(ElementCategory::AnimeTitle)
            .or_else(|| ele.get(ElementCategory::FileName)) // Try search full name if no anime title found
            .tap_none(|| warn!("No title found in filename"))
            .tap_some(|title| info!(title, "Parsed title"))?
            .pipe(|title| {
                self.search(SearchArg {
                    title,
                    begin: None,
                    end: None,
                })
            })
            .await?
            .tap(|res| info!(?res, "Search result"))
            .pipe(Some)
    }

    async fn locate_meta(&self, tmdb_id: u64) -> Option<WithId<Meta>> {
        self.meta
            .get_latest(tmdb_id)
            .await
            .tap_err(|error| warn!(?error, "failed to get meta"))
            .ok()?
    }

    #[instrument(target = "resolver", skip(self))]
    async fn extract(&self, filename: &str) -> ExtractResult {
        let mut titles = match_title_in_filename(filename)
            .map(|(l, r)| vec![l, r])
            .unwrap_or_default();
        let ele = self.parse_filename(filename);
        if let Some(title) = ele.get(ElementCategory::AnimeTitle) {
            titles.push(title)
        };
        let group = ele.get(ElementCategory::ReleaseGroup).map(ToOwned::to_owned);

        for title in titles {
            let title = title.to_owned();
            if let Some(id) = self.aliases.get(&title).await.expect("db error") {
                // Search alias first
                debug!(title, ?id, "Alias found");
                let meta = self.meta.get_by_oid(id).await.expect("db error");
                return ExtractResult { group, meta };
            } else if !is_mostly_ascii(&title) {
                // If it's not mostly ascii, search database
                if let Some(meta) = self.meta.text_search(&title).await.expect("db error") {
                    debug!(title, "Mongo text search found");
                    self.aliases.upsert(&title, &meta.id).await.expect("db error");
                    return ExtractResult {
                        group,
                        meta: Some(meta),
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
                self.aliases.upsert(&title, &meta.id).await.expect("db error");
                debug!(title, "TMDB search found");
                Some(meta)
            }
            .await
            {
                return ExtractResult { group, meta: Some(m) };
            };
        }

        debug!("No meta matched");

        ExtractResult { group, meta: None }
    }
}

pub struct State {
    index_job: Option<IndexJob>,
    index_timer: JoinHandle<()>,
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

        let arg = IndexArg {
            force: false,
            max: None,
            after: None,
            before: None,
        };
        this.send_message(Message::StartIndexJob { arg, port: None })
            .expect("Failed to start index job");
        let index_timer = ractor::time::send_interval(self.config.index_interval, this.get_cell(), move || {
            Message::StartIndexJob { arg, port: None }
        });
        Ok(State {
            index_job: None,
            index_timer,
        })
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        if let Some(job) = state.index_job.take() {
            job.stop();
        }
        state.index_timer.abort();
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
                port.send(self.extract(&file_name).await)
                    .tap_err(|error| {
                        warn!(?error, "failed to send reply");
                    })
                    .ok();
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
                if let Some(j) = state.index_job.take() {
                    j.stop()
                }
            }
            Message::CrudMeta(msg) => {
                self.meta.handle_crud(msg).await.expect("db error");
            }
        };

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use std::str::FromStr;

    use tap::Pipe;
    use tracing::{info, warn};

    use crate::test::run;

    #[rustfmt::skip]
    const PROBLEM: &[&str] = &[
        "[jibaketa合成&音頻壓制][代理商粵語]咒術迴戰 第二季 / Jujutsu Kaisen S2 - 19 [粵日雙語+內封繁體中文字幕](WEB 1920x1080 AVC AACx2 SRT Ani-One CHT)",
        "【喵萌奶茶屋】★01月新番★[到了30歲還是處男，似乎會變成魔法師 / 30-sai made Doutei dato Mahoutsukai ni Nareru Rashii / Cherimaho][09][1080p][繁日雙語][招募翻譯時軸]",
        "[DBD-Raws][喜羊羊与灰太狼之喜气羊羊过蛇年/The Mythical Ark: Adventures in Love & Happiness][1080P][WebRip][AVC][国粤韩多语][简繁英双语内封][FLAC+AAC][MKV]"
    ];

    #[test]
    fn test_match() {
        run(|env| async move {
            let a = env.resolver.extract(PROBLEM[0]).await;
            info!(?a);
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
                let res = env.resolver.extract(&title).await;
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

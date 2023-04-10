use bangumi::{
    endpoints::{
        FetchTag, FetchTags, GetCommonTags, GetCurrentV2, SearchTags, SearchTorrent, SearchTorrents,
    },
    Current, Id, Record, SearchResult, TagType, Torrent,
};
use clap::{Parser, Subcommand};
use color_eyre::{
    eyre::{bail, eyre},
    Result,
};
use forrit_core::BangumiSubscription;
use owo_colors::OwoColorize;
use regex::Regex;
use requestty::{self, ListItem, Question};
use rustify::{Client, Endpoint};
use tap::{Conv, Pipe, Tap, TryConv};
use unicode_width::UnicodeWidthStr;

use crate::{
    break_on_esc,
    cli::{print_sub, write_sub_with_id},
    continue_on_esc, pager, Config, DeleteSubs, ListSub, PostSub, PutSub, QuestionBuilderExt,
    QuickExec, SubscriptionExt,
};

#[derive(Debug, Clone, Subcommand)]
pub enum SubsCmd {
    /// Add one or more subscriptions
    #[clap(long_about = "Add one or more subscriptions by prompt or by bangumi id")]
    Add(SubsAddArg),

    /// List subscriptions
    List,

    /// Delete one or multiple subscriptions
    Del,

    /// Update all subscriptions
    Update,
}

impl SubsCmd {
    pub async fn run(self, config: Config) -> Result<()> {
        let forrit_client = Client::default(&config.server);
        let bangumi_client = Client::default(&config.bangumi);

        match self {
            Self::Add(arg) => arg.run(forrit_client, bangumi_client).await?,
            Self::List => ListSub::builder()
                .build()
                .quick_exec(&forrit_client)
                .await?
                .pipe(|x| {
                    if x.is_empty() {
                        println!("No subscription found");
                    } else {
                        pager(|w| {
                            for sub in x {
                                write_sub_with_id(w, &sub)?;
                                writeln!(w)?;
                            }
                            Ok(())
                        })
                        .unwrap();
                    }
                }),
            Self::Del | Self::Update => {
                let list = ListSub {}.quick_exec(&forrit_client).await?;
                if list.is_empty() {
                    println!("No subscriptions found");
                    return Ok(());
                }
                let len = list
                    .iter()
                    .map(|x| x.content().bangumi.name.width_cjk())
                    .max()
                    .unwrap_or(25);
                let choices = list
                    .iter()
                    .map(|sub| sub.content().display(len).to_string())
                    .collect::<Vec<_>>();
                match self {
                    Self::Del => {
                        choices
                            .pipe(|subs| {
                                Question::multi_select("BangumiSubscriptions").choices(subs)
                            })
                            .ask()?
                            .pipe(|res| res.into_iter().map(|idx| list[idx.index].id().clone()))
                            .collect::<Vec<_>>()
                            .pipe(|ids| DeleteSubs::builder().ids(ids).build())
                            .tap(|x| {
                                println!("Deleting {:#?}", x);
                            })
                            .exec(&forrit_client)
                            .await?;
                    }
                    Self::Update => {
                        choices
                            .pipe(|subs| Question::select("BangumiSubscriptions").choices(subs))
                            .ask()?
                            .pipe(|res| list[res.index].clone())
                            .pipe(|mut sub| async {
                                let id = sub.id().clone();

                                fill_sub_detail(
                                    &bangumi_client,
                                    sub.content().team.clone().into_iter().collect(),
                                    sub.content_mut(),
                                )
                                .await?;
                                Result::<PutSub>::Ok(
                                    PutSub::builder().id(id).sub(sub.into_content()).build(),
                                )
                            })
                            .await?
                            .quick_exec(&forrit_client)
                            .await?;
                    }
                    _ => unreachable!(),
                }
            }
        };
        Ok(())
    }
}

#[derive(Debug, Clone, Parser)]
pub struct SubsAddArg {
    /// Search for bangumi by name
    #[clap(conflicts_with = "bangumi")]
    query: Option<String>,

    /// Tag of the bangumi, can be found via `forrit search`
    #[clap(short, long, conflicts_with = "query")]
    bangumi: Option<Id>,

    /// Tag of the team, can be found via `forrit search`
    #[clap(long, requires = "bangumi")]
    team: Option<Id>,

    /// Auxiliary tags
    #[clap(
        short,
        long,
        requires = "bangumi",
        long_help = "Auxiliary tags of the torrent, language, resolution, etc."
    )]
    tag: Vec<Id>,

    /// Season of the bangumi
    #[clap(
        short,
        long,
        requires = "bangumi",
        long_help = "Season of the bangumi, default to 1. This is only used for naming storage \
                     directory."
    )]
    season: Option<u8>,

    /// Directory to store the torrent
    #[clap(
        short,
        long,
        requires = "bangumi",
        long_help = "Directory to store the torrent, default to the bangumi name."
    )]
    directory: Option<String>,

    /// Regex pattern to include torrent
    #[clap(
        short,
        long,
        requires = "bangumi",
        long_help = "Regex pattern to include torrent, when not set, all torrents are included"
    )]
    include_pattern: Option<Regex>,

    /// Regex pattern to exclude torrent
    #[clap(
        short,
        long,
        requires = "bangumi",
        long_help = "Regex pattern to exclude torrent, when not set, no torrent is excluded"
    )]
    exclude_pattern: Option<Regex>,
}

impl SubsAddArg {
    async fn run(self, forrit_client: Client, bangumi_client: Client) -> Result<()> {
        let SubsAddArg {
            query,
            bangumi,
            team,
            tag: tags,
            season,
            directory,
            include_pattern,
            exclude_pattern,
        } = self;

        if let Some(bangumi) = bangumi {
            let tag = FetchTag::builder()
                .id(bangumi.as_str())
                .build()
                .quick_exec(&bangumi_client)
                .await?;
            let team = if let Some(team) = team {
                FetchTag::builder()
                    .id(team.as_str())
                    .build()
                    .quick_exec(&bangumi_client)
                    .await?
                    .conv::<Record>()
                    .pipe(Some)
            } else {
                None
            };
            let sub = BangumiSubscription {
                bangumi: Record {
                    tag: bangumi,
                    name: tag.preferred_name_owned(),
                },
                team,
                season,
                tags,
                dir: directory,
                include_pattern,
                exclude_pattern,
            };
            let res = PostSub::builder()
                .sub(sub)
                .build()
                .quick_exec(&forrit_client)
                .await;

            println!("{:?}", res);
        } else {
            // User pass in query, so search for corresponding bangumi and teams first
            let sub = if let Some(query) = query {
                let mut tags = SearchTags::builder()
                    .name(&query)
                    .tag_type(TagType::Bangumi)
                    .build()
                    .quick_exec(&bangumi_client)
                    .await?
                    .resolve()?;

                let bangumi = tags
                    .iter()
                    .map(|tag| tag.preferred_name())
                    .pipe(|choices| Question::select("Bangumi").choices(choices))
                    .ask()?
                    .pipe(|idx| tags.swap_remove(idx.index));
                let tags = SearchTorrent::builder()
                    .tag_id(bangumi.id.as_str())
                    .build()
                    .quick_exec(&bangumi_client)
                    .await?
                    .pipe(|x: Vec<Torrent>| x)
                    .into_iter()
                    .flat_map(|x| x.tag_ids.into_iter())
                    .map(|x| x.0)
                    .collect::<Vec<_>>();
                if tags.is_empty() {
                    println!("No working team found");
                    return Ok(());
                }
                let teams = FetchTags::builder()
                    .ids(tags)
                    .build()
                    .quick_exec(&bangumi_client)
                    .await?
                    .into_iter()
                    .filter_map(|x| {
                        if x.tag_type == TagType::Team {
                            Some(x.conv::<Record>())
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<_>>();

                let mut sub = BangumiSubscription {
                    bangumi: bangumi.try_into()?,
                    ..Default::default()
                };

                fill_sub_detail(&bangumi_client, teams, &mut sub).await?;
                sub
            } else {
                request_sub(&bangumi_client, None).await?
            };

            PostSub::builder()
                .sub(sub)
                .build()
                .quick_exec(&forrit_client)
                .await?;
            println!("{} BangumiSubscription added!", "+".green())
        }
        Ok(())
    }
}

async fn request_sub(
    bangumi_client: &Client,
    sub_base: Option<BangumiSubscription>,
) -> Result<BangumiSubscription> {
    let Current {
        bangumis,
        working_teams,
    } = GetCurrentV2.quick_exec(bangumi_client).await?;
    // match sub_base {
    //     None => {
    //         let Current {
    //             bangumis,
    //             working_teams,
    //         } = api.current_v2().await?;
    //     }
    //     Some(sub) => {
    //         let tag = sub.bangumi.tag;
    //         let
    //     }
    // }

    let mut sub = sub_base.unwrap_or_default();

    sub.bangumi = bangumis
        .iter()
        .filter_map(|bangumi| {
            working_teams.get(&bangumi.tag_id)?;
            bangumi
                .tag
                .as_ref()
                .expect("v2 api should have tag")
                .inner()
                .preferred_name()
                .pipe(Some)
        })
        .pipe(|choices| Question::select("Bangumi").choices(choices))
        .ask()?
        .index
        .pipe(|idx| {
            bangumis
                .iter()
                .filter(|x| working_teams.get(&x.tag_id).is_some())
                .nth(idx)
        })
        .unwrap()
        .pipe(|bangumi| bangumi.try_conv::<Record>())?;
    let teams = working_teams
        .get(&sub.bangumi.tag)
        .ok_or_else(|| eyre!("No working team found for bangumi {}", sub.bangumi.name))?
        .iter()
        .map(|x| x.into())
        .collect::<Vec<Record>>();

    fill_sub_detail(bangumi_client, teams, &mut sub).await?;

    Ok(sub)
}

async fn fill_sub_detail(
    bangumi_client: &Client,
    mut teams: Vec<Record>,
    sub: &mut BangumiSubscription,
) -> Result<()> {
    const ADD_MORE_TAGS_FROM_COMMON: char = 'c';
    const ADD_MORE_TAGS_BY_SEARCH: char = 'f';
    const SET_SEASON: char = 's';
    const SET_DIRECTORY: char = 'd';
    const SET_INCLUDE_PATTERN: char = 'i';
    const SET_EXCLUDE_PATTERN: char = 'e';
    const TEST_TORRENT_RESULTS: char = 't';
    const VIEW_TORRENT_RESULTS: char = 'v';
    const QUIT: char = 'q';

    if teams.is_empty() {
    } else if teams.len() == 1 {
        sub.team = Some(teams.remove(0));
    } else {
        sub.team = teams
            .iter()
            .map(|team| team.name.as_str())
            .pipe(|choices| Question::select("Team").choices(choices))
            .ask()?
            .index
            .pipe(|idx| teams.swap_remove(idx))
            .pipe(Some);
    }
    let mut common_tags = None;
    loop {
        let next = break_on_esc! {
            Question::expand("Next")
                .choices([
                    (ADD_MORE_TAGS_FROM_COMMON, "Add more tags from common tags"),
                    (ADD_MORE_TAGS_BY_SEARCH, "Add more tags by search"),
                    (SET_SEASON, "Set season"),
                    (SET_DIRECTORY, "Set directory"),
                    (SET_INCLUDE_PATTERN, "Set include pattern"),
                    (SET_EXCLUDE_PATTERN, "Set exclude pattern"),
                    (TEST_TORRENT_RESULTS, "Test torrent results"),
                    (VIEW_TORRENT_RESULTS, "View current subscription"),
                ])
                .default_separator()
                .choice(QUIT, "Quit")
                .default_separator()
                .message("Next? (ESC to finish, Enter for detail)")
                .try_ask()
        }
        .key;
        match next {
            ADD_MORE_TAGS_FROM_COMMON => {
                if common_tags.is_none() {
                    common_tags = Some(GetCommonTags.quick_exec(bangumi_client).await?);
                }

                continue_on_esc! {
                    Question::multi_select("Tags")
                    .choices(
                        common_tags
                            .as_ref()
                            .unwrap()
                            .iter()
                            .map(|x| x.preferred_name().to_owned()),
                    )
                    .try_ask()
                };
            }
            ADD_MORE_TAGS_BY_SEARCH => {
                let tags = continue_on_esc! {
                    Question::input("search")
                        .message("Search for tag: ")
                        .try_ask()
                }
                .pipe_as_ref(|s| SearchTags::builder().name(s))
                .build()
                .quick_exec(bangumi_client)
                .await?;
                let SearchResult::Found(tags) = tags else {
                    println!("No tags found");
                    continue;
                };
                tags.iter()
                    .map(|x| x.preferred_name())
                    .pipe(|x| Question::multi_select("Tags").choices(x))
                    .ask()?
                    .into_iter()
                    .map(|ListItem { index, .. }| tags[index].id.clone())
                    .pipe(|x| sub.tags.extend(x));
            }
            SET_SEASON => continue_on_esc! {
                Question::int("season")
                .message("Season: ")
                .validate(|x, _| {
                    if x > 0 && x < u8::MAX as i64 {
                        Ok(())
                    } else {
                        Err(format!("Season must be positive and less than {}", u8::MAX))
                    }
                })
                .try_ask()
            }
            .pipe(|season| sub.season = Some(season as u8)),
            SET_DIRECTORY => continue_on_esc! {
                Question::input("directory")
                .message("Directory: ")
                .try_ask()

            }
            .pipe(|dir| sub.dir = Some(dir)),
            SET_INCLUDE_PATTERN | SET_EXCLUDE_PATTERN => continue_on_esc! {
                Question::input("pattern")
                    .message("Input a regex: ")
                    .validate(|x, _| {
                        if Regex::new(x).is_ok() {
                            Ok(())
                        } else {
                            Err("Invalid regex".to_owned())
                        }
                    })
                    .try_ask()
            }
            .pipe_as_ref(Regex::new)
            .unwrap()
            .pipe(|x| match next {
                SET_INCLUDE_PATTERN => sub.include_pattern = Some(x),
                SET_EXCLUDE_PATTERN => sub.exclude_pattern = Some(x),
                _ => unreachable!(),
            }),
            TEST_TORRENT_RESULTS => sub
                .tags()
                .map(|id| id.to_string())
                .collect::<Vec<_>>()
                .pipe(|param| SearchTorrents::builder().tags(param))
                .build()
                .quick_exec(bangumi_client)
                .await?
                .pipe(|res| {
                    res.torrents.into_iter().filter(|x| {
                        if let Some(i) = &sub.include_pattern {
                            if !i.is_match(&x.title) {
                                return false;
                            }
                        }

                        if let Some(e) = &sub.exclude_pattern {
                            if e.is_match(&x.title) {
                                return false;
                            }
                        }

                        true
                    })
                })
                .for_each(|t| println!("{}", t.title)),
            VIEW_TORRENT_RESULTS => print_sub(sub),
            QUIT => bail!("Aborted"),
            _ => unreachable!(),
        }
    }
    Ok(())
}

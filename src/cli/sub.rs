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
use forrit_core::Subscription;
use owo_colors::OwoColorize;
use regex::Regex;
use requestty::{self, ListItem, Question};
use rustify::Client;
use tap::{Conv, Pipe, Tap, TryConv};
use unicode_width::UnicodeWidthStr;

use crate::{
    break_on_esc,
    cli::{print_sub, print_sub_with_id},
    continue_on_esc, Config, DeleteSubs, ListSub, PostSub, PutSub, QuestionBuilderExt, QuickExec,
    SubscriptionExt,
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
                        for sub in x {
                            print_sub_with_id(&sub);
                            println!("{:<15}", "");
                        }
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
                            .pipe(|subs| Question::multi_select("Subscriptions").choices(subs))
                            .ask()?
                            .pipe(|res| res.into_iter().map(|idx| list[idx.index].id().clone()))
                            .collect::<Vec<_>>()
                            .pipe(|ids| DeleteSubs::builder().ids(ids).build())
                            .quick_exec(&forrit_client)
                            .await?;
                    }
                    Self::Update => {
                        choices
                            .pipe(|subs| Question::select("Subscriptions").choices(subs))
                            .ask()?
                            .pipe(|res| list[res.index].clone())
                            .pipe(|sub| async {
                                let id = sub.id().clone();
                                let sub =
                                    request_sub(&bangumi_client, Some(sub.into_content())).await?;
                                Result::<PutSub>::Ok(PutSub::builder().id(id).sub(sub).build())
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
            let sub = Subscription {
                bangumi: Record {
                    tag: bangumi,
                    name: tag.preferred_name_owned(),
                },
                team,
                season,
                tags,
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
                    .tap(|tag| println!("{tag:#?}"))
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

                let mut sub = Subscription {
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
            println!("{} Subscription added!", "+".green())
        }
        Ok(())
    }
}

async fn request_sub(
    bangumi_client: &Client,
    sub_base: Option<Subscription>,
) -> Result<Subscription> {
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
    sub: &mut Subscription,
) -> Result<()> {
    if teams.len() == 1 {
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
                    ('c', "Add more tags from common tags"),
                    ('f', "Add more tags by search"),
                    ('s', "Set season"),
                    ('i', "Set include pattern"),
                    ('e', "Set exclude pattern"),
                    ('t', "Test torrent results"),
                    ('v', "View current subscription"),
                ])
                .default_separator()
                .choice('x', "Cancel")
                .default_separator()
                .message("Next? (ESC to finish, Enter for detail)")
                .try_ask()
        }
        .key;
        match next {
            'c' => {
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
            'f' => {
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
            's' => continue_on_esc! {
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
            'i' | 'e' => continue_on_esc! {
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
                'i' => sub.include_pattern = Some(x),
                'e' => sub.exclude_pattern = Some(x),
                _ => unreachable!(),
            }),
            't' => sub
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
            'v' => print_sub(sub),
            'x' => bail!("Aborted"),
            _ => unreachable!(),
        }
    }
    Ok(())
}
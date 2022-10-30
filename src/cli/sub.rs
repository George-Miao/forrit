use bangumi::{Api, Current, Id, Record, SearchResult};
use clap::Subcommand;
use color_eyre::{
    eyre::{bail, eyre},
    Result,
};
use forrit_core::Subscription;
use owo_colors::OwoColorize;
use regex::Regex;
use requestty::{self, ListItem, Question};
use rustify::Client;
use tap::{Conv, Pipe, TryConv};

use crate::{
    break_on_esc, continue_on_esc, Config, DeleteSubs, FormatExec, ListSub, ParsedConfig, PostSub,
    PutSub, QuestionBuilderExt,
};

#[derive(Debug, Clone, Subcommand)]
pub enum SubsCmd {
    /// Add one or more subscriptions
    #[clap(long_about = "Add one or more subscriptions by prompt or by bangumi id")]
    Add {
        /// Tag of the bangumi, can be found via `forrit search`
        #[clap(short, long)]
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
            long_help = "Season of the bangumi, default to 1. This is only used for naming \
                         storage directory."
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
    },

    /// Delete one or multiple subscriptions
    Del,

    /// Update all subscriptions
    Update,
}

impl SubsCmd {
    pub async fn run(self, config: Config) -> Result<()> {
        let client = Client::default(&config.server);
        let api = Api::new();
        match self {
            Self::Add {
                bangumi,
                season,
                team,
                tag: tags,
                include_pattern,
                exclude_pattern,
            } => {
                if let Some(bangumi) = bangumi {
                    let tag = api.fetch_tag(bangumi.as_str()).await?;
                    let team = if let Some(team) = team {
                        api.fetch_tag(team.as_str())
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
                        .formatted_exec(&client)
                        .await;

                    println!("{:?}", res);
                } else {
                    let sub = request_sub(&config, &api, None).await?;

                    PostSub::builder()
                        .sub(sub)
                        .build()
                        .formatted_exec(&client)
                        .await?;
                    println!("{} Subscription added!", "+".green())
                }
            }
            Self::Del | Self::Update => {
                let list = ListSub {}.formatted_exec(&client).await?;
                if list.is_empty() {
                    println!("No subscriptions found");
                    return Ok(());
                }
                let choices = list
                    .iter()
                    .map(|sub| sub.content().display(25).to_string())
                    .collect::<Vec<_>>();
                match self {
                    Self::Del => {
                        choices
                            .pipe(|subs| Question::multi_select("Subscriptions").choices(subs))
                            .ask()?
                            .pipe(|res| res.into_iter().map(|idx| list[idx.index].id().clone()))
                            .collect::<Vec<_>>()
                            .pipe(|ids| DeleteSubs::builder().ids(ids).build())
                            .formatted_exec(&client)
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
                                    request_sub(&config, &api, Some(sub.into_content())).await?;
                                Result::<PutSub>::Ok(PutSub::builder().id(id).sub(sub).build())
                            })
                            .await?
                            .formatted_exec(&client)
                            .await?;
                    }
                    _ => unreachable!(),
                }
            }
        };
        Ok(())
    }
}

async fn request_sub(
    _: &ParsedConfig,
    api: &Api,
    sub_base: Option<Subscription>,
) -> Result<Subscription> {
    let Current {
        bangumis,
        working_teams,
    } = api.current_v2().await?;

    let mut sub = sub_base.unwrap_or_default();

    bangumis
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
        .pipe(|bangumi| {
            sub.bangumi = bangumi.try_conv::<Record>()?;

            working_teams.get(&bangumi.tag_id).ok_or_else(|| {
                eyre!(
                    "No working team found for bangumi {}",
                    bangumi.tag.as_ref().unwrap().preferred_name()
                )
            })
        })?
        .pipe(|teams| -> Result<()> {
            teams
                .iter()
                .map(|x| x.inner().tag.preferred_name().to_owned())
                .pipe(|x| Question::select("Working team").choices(x))
                .ask()?
                .index
                .pipe(|x| sub.team = teams.get(x).unwrap().conv::<Record>().pipe(Some));
            Ok(())
        })?;

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
                    common_tags = Some(api.common_tags().await?);
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
                .pipe_as_ref(|s| api.search_tag_multi(s))
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
                .pipe(|param| api.search_torrent(param))
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
                .for_each(|_t| {
                    // let tags = t.
                    // println!("{}", t.title)
                }),
            'x' => bail!("Aborted"),
            _ => unreachable!(),
        }
    }

    Ok(sub)
}

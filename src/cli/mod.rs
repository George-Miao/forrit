use std::{
    future::Future,
    io::{stdout, Write},
    sync::atomic::{AtomicUsize, Ordering},
};

use bangumi::{endpoints::SearchTags, SearchResult};
use clap::{Parser, Subcommand};
use color_eyre::{eyre::bail, Result};
use forrit_core::{BangumiSubscription, Event, WithId};
use owo_colors::OwoColorize;
use requestty::{
    prompt_one,
    question::{
        ConfirmBuilder, ExpandBuilder, FloatBuilder, InputBuilder, IntBuilder, MultiSelectBuilder,
        PasswordBuilder, SelectBuilder,
    },
    symbols, ErrorKind, ExpandItem, ListItem, OnEsc,
};
use rustify::{Client, Endpoint};
use serde_json::from_slice;
use tap::Pipe;
use url::Url;

use crate::Config;

mod_use::mod_use![sub, config];

#[derive(Debug, Clone, Parser)]
#[command(author, version, about)]
pub struct Arg {
    #[clap(subcommand)]
    cmd: Cmd,
    #[clap(short, long)]
    server: Option<Url>,
}

impl Arg {
    pub async fn run(self, mut config: Config) -> Result<()> {
        if let Some(server) = self.server {
            config.server = server.to_string();
        }
        self.cmd.run(config).await
    }
}

#[derive(Debug, Clone, Subcommand)]
enum Cmd {
    /// Manage subscriptions on Forrit server
    #[command(subcommand, alias = "sub")]
    Subs(SubsCmd),

    /// Manage configs
    Config {
        #[command(subcommand)]
        cmd: Option<ConfigCmd>,
    },

    /// Search for tags on bangumi.moe
    Search {
        query: String,
    },

    Events,
}

impl Cmd {
    async fn run(self, config: Config) -> Result<()> {
        symbols::set(symbols::ASCII);
        match self {
            Cmd::Subs(cmd) => cmd.run(config).await,
            Cmd::Config { cmd } => cmd.unwrap_or_default().run(config).await,
            Cmd::Events => {
                print_events(config).await?;
                Ok(())
            }
            Cmd::Search { query } => {
                let res = SearchTags::builder()
                    .name(query.as_str())
                    .build()
                    .exec(&Client::default(bangumi::DEFAULT_DOMAIN))
                    .await?
                    .parse()?;
                let SearchResult::Found(res) = res else {
                    bail!("No result found");
                };
                res.into_iter()
                    .for_each(|x| println!("{}    {}", x.id, x.preferred_name()));
                Ok(())
            }
        }
    }
}

type ReqFut<'a, E: Endpoint + 'a, C: rustify::client::Client + 'a> =
    impl Future<Output = Result<E::Response>> + 'a;

pub trait QuickExec<E: Endpoint> {
    fn quick_exec<'a, C: rustify::client::Client>(&'a self, client: &'a C) -> ReqFut<'a, E, C>;
}

impl<E: Endpoint> QuickExec<E> for E {
    fn quick_exec<'a, C: rustify::client::Client>(&'a self, client: &'a C) -> ReqFut<'a, E, C> {
        async move {
            let mut spin = spinners::Spinner::new(spinners::Spinners::Dots2, "Loading..".into());
            let res = self.exec(client).await?.parse()?;
            spin.stop();
            let w = stdout();
            write!(&w, "\x1b[2K\x1b[G")?;
            (&w).flush()?;
            Result::<E::Response>::Ok(res)
        }
    }
}

async fn print_events(config: Config) -> Result<()> {
    let mut req = reqwest::get(format!("{}/events", config.server))
        .await?
        .error_for_status()?;
    let mut buf = Vec::with_capacity(1 << 8);
    while let Some(chunk) = req.chunk().await? {
        if chunk.is_empty() {
            break;
        }
        if chunk.contains(&b'\n') {
            let mut lines = chunk.split_inclusive(|c| c == &b'\n');
            buf.extend_from_slice(lines.next().unwrap());
            let [data @ .., _] = buf.as_slice() else {
                break
            };
            let event = from_slice::<Event>(data)?;
            println!("{:#?}", event);
            buf.clear();

            for line in lines {
                if line.last().unwrap() == &b'\n' {
                    let [data @ .., _] = line else {
                        unreachable!()
                    };
                    let event = from_slice::<Event>(data)?;
                    println!("{:#?}", event);
                } else {
                    buf.extend_from_slice(line);
                }
            }
        } else {
            buf.extend_from_slice(&chunk);
        }
    }
    Ok(())
}

fn print_event(e: &Event) {
    match e {
        Event::JobAdded(j) => println!("{}", "Job added".blue()),
        Event::DownloadStart { url } => todo!(),
        Event::Warn(w) => todo!(),
        Event::SubscriptionAdded(s) => todo!(),
        Event::SubscriptionUpdated { old, new } => todo!(),
        Event::SubscriptionRemoved(s) => todo!(),
        Event::MultipleSubscriptionRemoved(s) => todo!(),
    }
}

pub fn get_indent() -> (usize, impl FnOnce(usize)) {
    static INDENT: AtomicUsize = AtomicUsize::new(10);
    (INDENT.load(Ordering::Relaxed), |len| {
        INDENT.store(len, Ordering::Relaxed)
    })
}

pub fn print_indent(s: &str) {
    let (len, set_indent) = get_indent();
    if s.len() > len {
        set_indent(s.len() + 2);
    }

    let (len, _) = get_indent();

    print_indent_with(s, len);
}

fn print_indent_with(s: &str, num: usize) {
    write_indent_with(&mut stdout(), s, num).unwrap()
}

fn write_indent_with(w: &mut dyn Write, s: &str, num: usize) -> std::io::Result<()> {
    write!(w, "{0:>1$} ", s.green().bold(), num)
}

// fn print_sub_with_id(sub: &WithId<String, BangumiSubscription>) {
//     write_sub_with_id(&mut stdout(), sub).unwrap()
// }

fn write_sub_with_id(
    w: &mut dyn Write,
    sub: &WithId<String, BangumiSubscription>,
) -> std::io::Result<()> {
    write_indent_with(w, "Subs ID", 8)?;
    writeln!(w, "{}", sub.id())?;
    write_sub(w, sub.content())
}

fn print_sub(sub: &BangumiSubscription) {
    write_sub(&mut stdout(), sub).unwrap();
}

fn write_sub(w: &mut dyn Write, sub: &BangumiSubscription) -> std::io::Result<()> {
    write_indent_with(w, "Name", 8)?;
    writeln!(w, "{}", sub.bangumi.name)?;

    write_indent_with(w, "Team", 8)?;
    writeln!(
        w,
        "{}",
        sub.team.as_ref().map(|x| x.name.as_str()).unwrap_or("None")
    )?;
    write_indent_with(w, "Tags", 8)?;
    writeln!(w, "{:?}", sub.tags)?;

    write_indent_with(w, "Season", 8)?;
    writeln!(w, "{}", sub.season.unwrap_or(1))?;

    write_indent_with(w, "Inc. Pat", 8)?;
    writeln!(
        w,
        "{}",
        sub.include_pattern
            .as_ref()
            .map(|x| x.as_str())
            .unwrap_or("None")
    )?;

    write_indent_with(w, "Exc. Pat", 8)?;
    writeln!(
        w,
        "{}",
        sub.exclude_pattern
            .as_ref()
            .map(|x| x.as_str())
            .unwrap_or("None")
    )
}

pub trait QuestionBuilderExt {
    type Output;
    fn try_ask(self) -> Result<Option<Self::Output>>;
    fn ask(self) -> Result<Self::Output>
    where
        Self: Sized,
    {
        self.try_ask()?
            .ok_or_else(|| color_eyre::eyre::eyre!("Aborted"))?
            .pipe(Ok)
    }
}

macro_rules! continue_on_esc {
    {$e:expr} => {{
        match $e? {
            Some(x) => x,
            _ => continue,
        }
    }};
}

macro_rules! break_on_esc {
    {$e:expr} => {{
        match $e? {
            Some(x) => x,
            _ => break,
        }
    }};
}

pub(crate) use break_on_esc;
pub(crate) use continue_on_esc;

macro_rules! impl_question_builder_ext {
    ($t:ty, $f:ident, $o:ty) => {
        impl QuestionBuilderExt for $t {
            type Output = $o;

            fn try_ask(self) -> Result<Option<Self::Output>> {
                match prompt_one(self.on_esc(OnEsc::Terminate).build()) {
                    Ok(x) => Ok(Some(x.$f().unwrap())),
                    Err(ErrorKind::Aborted) => Ok(None),
                    Err(e) => Err(e.into()),
                }
            }

            fn ask(self) -> Result<Self::Output> {
                prompt_one(self.build())?.$f().unwrap().pipe(Ok)
            }
        }
    };
}

impl_question_builder_ext!(SelectBuilder<'_>, try_into_list_item, ListItem);
impl_question_builder_ext!(MultiSelectBuilder<'_>, try_into_list_items, Vec<ListItem>);
impl_question_builder_ext!(ExpandBuilder<'_>, try_into_expand_item, ExpandItem);
impl_question_builder_ext!(InputBuilder<'_>, try_into_string, String);
impl_question_builder_ext!(PasswordBuilder<'_>, try_into_string, String);
impl_question_builder_ext!(ConfirmBuilder<'_>, try_into_bool, bool);
impl_question_builder_ext!(IntBuilder<'_>, try_into_int, i64);
impl_question_builder_ext!(FloatBuilder<'_>, try_into_float, f64);

use std::{
    future::Future,
    sync::atomic::{AtomicUsize, Ordering},
};

use bangumi::{endpoints::SearchTags, SearchResult};
use clap::{Parser, Subcommand};
use color_eyre::{eyre::bail, Result};
use forrit_core::{Subscription, WithId};
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
use tap::Pipe;
use url::Url;

use crate::Config;

mod_use::mod_use![sub];

#[derive(Debug, Clone, Parser)]
#[command(author, version, about)]
pub struct Arg {
    #[clap(subcommand)]
    cmd: Cmd,
    #[clap(short, long)]
    server: Option<Url>,
}

impl Arg {
    pub async fn run(self, config: Config) -> Result<()> {
        self.cmd.run(config).await
    }
}

#[derive(Debug, Clone, Subcommand)]
enum Cmd {
    /// Manage subscriptions on Forrit server
    #[command(subcommand, alias = "sub")]
    Subs(SubsCmd),

    /// Manage configs
    Config,

    /// Search for tags on bangumi.moe
    Search { query: String },
}

impl Cmd {
    async fn run(self, config: Config) -> Result<()> {
        symbols::set(symbols::ASCII);
        match self {
            Cmd::Subs(cmd) => cmd.run(config).await,
            Cmd::Config => todo!(),
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
            print!("\x1b[2K\x1b[G");
            Result::<E::Response>::Ok(res)
        }
    }
}

pub fn print_indent(s: &str) {
    static INDENT: AtomicUsize = AtomicUsize::new(10);

    if s.len() > INDENT.load(Ordering::Relaxed) {
        INDENT.store(s.len() + 2, Ordering::Relaxed);
    }

    print_indent_with(s, INDENT.load(Ordering::Relaxed));
}

fn print_indent_with(s: &str, num: usize) {
    print!("{0:>1$} ", s.green().bold(), num);
}

fn print_sub_with_id(sub: &WithId<String, Subscription>) {
    print_indent_with("Subs ID", 8);
    println!("{}", sub.id());
    print_sub(sub.content())
}

fn print_sub(sub: &Subscription) {
    print_indent_with("Name", 8);
    println!("{}", sub.bangumi.name);

    print_indent_with("Team", 8);
    println!(
        "{}",
        sub.team.as_ref().map(|x| x.name.as_str()).unwrap_or("None")
    );
    print_indent_with("Tags", 8);
    println!("{:?}", sub.tags);

    print_indent_with("Season", 8);
    println!("{}", sub.season.unwrap_or(1));

    print_indent_with("Inc. Pat", 8);
    println!(
        "{}",
        sub.include_pattern
            .as_ref()
            .map(|x| x.as_str())
            .unwrap_or("None")
    );

    print_indent_with("Exc. Pat", 8);
    println!(
        "{}",
        sub.exclude_pattern
            .as_ref()
            .map(|x| x.as_str())
            .unwrap_or("None")
    );
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

use std::future::Future;

use bangumi::{Api, SearchResult};
use clap::{Parser, Subcommand};
use color_eyre::{eyre::bail, Result};
use requestty::{
    prompt_one,
    question::{
        ConfirmBuilder, ExpandBuilder, FloatBuilder, InputBuilder, IntBuilder, MultiSelectBuilder,
        PasswordBuilder, SelectBuilder,
    },
    symbols, ErrorKind, ExpandItem, ListItem, OnEsc,
};
use rustify::{errors::ClientError, Endpoint};
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
                let SearchResult::Found(res) = Api::new().search_tag_multi(query.as_str()).await? else {
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

pub trait FormatExec<E: Endpoint> {
    fn formatted_exec<'a, C: rustify::client::Client>(&'a self, client: &'a C) -> ReqFut<'a, E, C>;
}

impl<E: Endpoint> FormatExec<E> for E {
    fn formatted_exec<'a, C: rustify::client::Client>(&'a self, client: &'a C) -> ReqFut<'a, E, C> {
        async move {
            let res = self
                .exec(client)
                .await
                .format_error()?
                .parse()
                .format_error()?;
            Result::<E::Response>::Ok(res)
        }
    }
}

pub trait FormatError<T> {
    fn format_error(self) -> color_eyre::Result<T>;
}

impl<T> FormatError<T> for std::result::Result<T, ClientError> {
    fn format_error(self) -> color_eyre::Result<T> {
        let error = match self {
            Ok(x) => return Ok(x),
            Err(e) => e,
        };

        match error {
            ClientError::DataParseError { source } => bail!("Error while parsing data: {source}"),
            ClientError::EndpointBuildError { source } => {
                bail!("Error while building endpoint: {source}")
            }
            ClientError::GenericError { source } => bail!("Error: {source}"),
            ClientError::ReqwestBuildError { source } => bail!("Error while request: {source}"),
            ClientError::ResponseError { source } => bail!("Error in response: {source}"),
            ClientError::RequestError {
                source,
                url,
                method,
            } => bail!("Error while {method} {url}: {source}"),
            ClientError::RequestBuildError {
                source,
                method,
                url,
            } => bail!("Error while build {method:?} {url}: {source}"),

            ClientError::ResponseConversionError { source, .. } => {
                bail!("Error while converting response: {source}")
            }
            ClientError::ResponseParseError { source, .. } => {
                bail!("Error while parsing response: {source}")
            }
            ClientError::ServerResponseError { code, content } => {
                if let Some(content) = content {
                    bail!("Server error: {content} (HTTP {code})")
                } else {
                    bail!("Server error (HTTP {code})")
                }
            }
            ClientError::UrlBuildError { source } => bail!("Error while building url: {source}"),
            ClientError::UrlQueryParseError { source } => {
                bail!("Error while parsing query: {source}")
            }
            ClientError::UrlParseError { source } => bail!("Error while parsing url: {source}"),
        }
    }
}

// fn print_indent(s: &str) {
//     static INDENT: AtomicUsize = AtomicUsize::new(7);

//     if s.len() > INDENT.load(Ordering::Relaxed) {
//         INDENT.store(s.len() + 2, Ordering::Relaxed);
//     }

//     print!("{0:>1$} ", s.green(), INDENT.load(Ordering::Relaxed));
// }

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

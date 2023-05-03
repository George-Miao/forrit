use std::ops::Deref;

use clap::Subcommand;
use color_eyre::{eyre::bail, Result};
use owo_colors::OwoColorize;
use rustified::Client;
use serde_json::Value;

use crate::{pager, prettify_value, Config, GetConfig, QuickExec};

#[derive(Debug, Clone, Default, Subcommand)]
pub enum ConfigCmd {
    /// List all configs
    #[default]
    List,
}

impl ConfigCmd {
    pub async fn run(self, config: Config) -> Result<()> {
        let client = Client::default(config.server.as_str());
        let server: Value = GetConfig.quick_exec(&client).await?;
        let Value::Object(server) = server else {
            bail!("Invalid response");
        };

        pager(|w| {
            write!(
                w,
                "  {}\n\n{}\n\n  {}\n\n{}",
                "Client config".bold(),
                prettify_value(config.deref(), 0),
                "Server Config".bold(),
                prettify_value(&server, 0)
            )
        })?;

        Ok(())
    }
}

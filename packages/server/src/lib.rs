#![allow(clippy::large_enum_variant)]
#![feature(lazy_cell, let_chains, try_blocks, type_changing_struct_update)]

pub mod api;
pub mod db;
pub mod dispatcher;
pub mod downloader;
pub mod notifier;
pub mod resolver;
pub mod sourcer;
pub mod test;
pub mod util;

use std::sync::LazyLock;

const ACTOR_ERR: &str = "Actor is not running or registered";
const SEND_ERR: &str = "Failed to send message to actor";
const RECV_ERR: &str = "Failed to receive response from actor";

static REQ: LazyLock<reqwest::Client> = LazyLock::new(reqwest::Client::new);

#![feature(let_chains, once_cell, duration_constants)]

use std::sync::LazyLock;

use http_client::hyper::HyperClient;

mod_use::mod_use![source, download, notify, config];

pub static HTTP_CLIENT: LazyLock<HyperClient> = LazyLock::new(HyperClient::new);

fn main() {
    println!("Hello, world!");
}

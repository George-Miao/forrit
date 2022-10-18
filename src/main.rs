#![feature(iter_intersperse)]

use std::fs;

use color_eyre::Result;
use rss::Channel;

use crate::{
    bangumi_moe::{Current, ID},
    model::Subscribed,
};

mod api;
mod bangumi_moe;
mod model;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    // let bgm = reqwest::get("https://bangumi.moe/api/bangumi/current")
    //     .await?
    //     .json::<Vec<Bangumi>>()
    //     .await?;

    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id == ID("62c6ce11f248710007e811b1".into()))
        .unwrap();
    let team = bgm.working_teams[&example.tag_id.0][0].clone();

    let sub = Subscribed {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
    };

    let rss = sub.rss_url_v1()?;

    let rss_content = reqwest::get(rss).await?.bytes().await?;
    let c = Channel::read_from(&rss_content[..])?;

    println!("{:#?}", c);

    Ok(())
}

#![feature(iter_intersperse)]
#![feature(let_chains)]
#![feature(try_blocks)]

#[macro_use]
extern crate ejdb;

use std::{fs, ops::Deref};

use color_eyre::{eyre::eyre, Result};
use ejdb::{
    bson,
    query::{Q, QH},
    Collection, Database,
};
use rss::Item;
use tracing::info;

use crate::{bangumi_moe::v2::Current, model::Subscription};

mod_use::mod_use![server, model, bangumi_moe, ext, config, util];

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    run().await?;

    Ok(())
}

async fn run() -> Result<()> {
    let bgm = fs::read("data/bangumi.current.v2.json")?;
    let bgm: Current = serde_json::from_slice(&bgm)?;

    let example = bgm
        .bangumis
        .into_iter()
        .find(|x| x.tag_id.deref() == "62c6ce11f248710007e811b1")
        .unwrap()
        .unwrap();

    let team = bgm.working_teams[&example.tag_id][0].clone().unwrap();

    let sub = Subscription {
        tags: vec![team.tag_id],
        bangumi_tag: example.tag,
        season: None,
        include_pattern: None,
        exclude_pattern: None,
    };

    // let mut tag_set = HashSet::new();
    // let teams_tags = bgm
    //     .working_teams
    //     .into_values()
    //     .flat_map(|x| x.into_iter())
    //     .map(|x| x.unwrap().tag);
    // let all_tags = bgm
    //     .bangumis
    //     .into_iter()
    //     .map(|x| x.unwrap().tag)
    //     .chain(teams_tags)
    //     .filter(|t| {
    //         if tag_set.contains(&t.id) {
    //             false
    //         } else {
    //             tag_set.insert(t.id.clone());
    //             true
    //         }
    //     })
    //     .map(|x| match ejdb::bson::to_bson(&x.unwrap()).unwrap() {
    //         ejdb::bson::Bson::Document(doc) => doc,
    //         _ => unreachable!(),
    //     });
    // info!("all_tags: {all_tags:#?}");
    // assert_bson_iter(&all_tags);
    // let bgm = reqwest::get("https://bangumi.moe/api/bangumi/current")
    //     .await?
    //     .json::<Vec<Bangumi>>()
    //     .await?;
    // let db = ejdb::Database::open("data/main.db")?;

    // let tags = db.collection("tags")?;
    // let jobs = db.collection("jobs")?;
    // let records = db.collection("records")?;

    // records
    //     .query(Q.empty(), QH.empty())
    //     .find()?
    //     .try_for_each(|x| {
    //         info!("{:#?}", x?);
    //         Result::<()>::Ok(())
    //     })?;

    // for item in items {
    //     create_rss_job(&records, item)?;
    // }

    // for i in tags
    //     .query(Q.field("type").eq("bangumi"), QH.empty())
    //     .find()?
    //     .map(|x| x.map(|x: OrderedDocument| -> WithOId<Tag> {
    // from_bson(x.into()).unwrap() })) {
    //     info!("i: {i:#?}");
    // }

    // col.save_all(all_tags)?;

    // for i in col.query(Q.slice("", i64::MAX), QH.empty()).find()? {
    //     let t: Tag = from_bson(i?.into())?;
    //     info!("{:#?}", t);
    // }

    // info!("{:#?}", res);
    Ok(())
}

fn create_rss_job(records: &Collection, item: &Item) -> Result<Option<()>> {
    let guid = item.guid.as_ref().ok_or_else(|| eyre!("no guid"))?.value();
    let enc = item
        .enclosure
        .as_ref()
        .ok_or_else(|| eyre!("No enclosure"))?;
    let url = enc.url();

    if records
        .query(Q.field("guid").eq(guid), QH.empty())
        .count()?
        > 0
    {
        info!("Item already exists: {url}")
    } else {
        records
            .save(bson! {
                "guid" => guid,
                "url" => url
            })
            .unwrap();
        info!("New item: {url}")
    }

    Ok(Some(()))
}

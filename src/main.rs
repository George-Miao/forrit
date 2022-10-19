#![feature(iter_intersperse)]

use color_eyre::Result;
use ejdb::{
    bson::{from_bson, ordered::OrderedDocument},
    query::{Q, QH},
};
use tracing::info;

use crate::{
    bangumi_moe::v2::{Tag, WithId},
    model::WithOId,
};

mod api;
mod bangumi_moe;
mod model;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    run().await?;

    Ok(())
}

async fn run() -> Result<()> {
    // let bgm = fs::read("data/bangumi.current.v2.json")?;
    // let bgm: Current = serde_json::from_slice(&bgm)?;

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

    let db = ejdb::Database::open("data/main.db")?;

    let col = db.collection("tags")?;

    for i in col
        .query(Q.field("type").eq("bangumi"), QH.empty())
        .find()?
        .map(|x| x.map(|x: OrderedDocument| -> WithOId<Tag> { from_bson(x.into()).unwrap() }))
    {
        info!("i: {i:#?}");
    }

    // col.save_all(all_tags)?;

    // for i in col.query(Q.slice("", i64::MAX), QH.empty()).find()? {
    //     let t: Tag = from_bson(i?.into())?;
    //     info!("{:#?}", t);
    // }

    // info!("{:#?}", res);
    Ok(())
}

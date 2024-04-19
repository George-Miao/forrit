use forrit_core::{
    date::YearSeason,
    model::{IndexArg, Meta, WithId},
};
use mongodb::bson::oid::ObjectId;
use ractor::ActorCell;

use crate::{
    resolver::{index::IndexStatRecv, ExtractResult, Message, Resolver},
    util::ActorCellExt,
    ACTOR_ERR, RECV_ERR, RPC_TIMEOUT, SEND_ERR,
};

fn resolver() -> ActorCell {
    ractor::registry::where_is(Resolver::NAME.to_owned()).expect(ACTOR_ERR)
}

/// Resolve file name and match it to a meta entry.
pub async fn resolve(file_name: String) -> ExtractResult {
    resolver()
        .call(|port| Message::Resolve { file_name, port }, Some(RPC_TIMEOUT))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub async fn get_index() -> Option<IndexStatRecv> {
    resolver()
        .call(Message::GetIndexJob, Some(RPC_TIMEOUT))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub async fn start_index(arg: IndexArg) -> IndexStatRecv {
    resolver()
        .call(
            |port| Message::StartIndexJob { arg, port: Some(port) },
            Some(RPC_TIMEOUT),
        )
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub async fn get_by_season(season: Option<YearSeason>) -> Vec<WithId<Meta>> {
    resolver()
        .call(|port| Message::GetBySeason { season, port }, Some(RPC_TIMEOUT))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

pub fn stop_index() {
    resolver().send_message(Message::StopIndexJob).expect(SEND_ERR)
}

pub(super) fn index_finished() {
    resolver().send_message(Message::IndexJobFinished).expect(SEND_ERR)
}

pub async fn get_one(id: ObjectId) -> Option<WithId<Meta>> {
    resolver()
        .call(|port| Message::GetOne { id, port }, Some(RPC_TIMEOUT))
        .await
        .expect(SEND_ERR)
        .expect(RECV_ERR)
}

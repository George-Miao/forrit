use std::{sync::Arc, time::Duration};

use futures::{
    channel::mpsc::{Receiver, Sender},
    StreamExt,
};
use stream_throttle::{ThrottlePool, ThrottleRate, ThrottledStream};

use crate::IntoStream;

pub enum Request {}

async fn init_server(tx: Sender<()>) {}

async fn handle_req(mut rx: Receiver<Request>) {}

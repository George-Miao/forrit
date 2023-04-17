use std::{ops::Deref, sync::OnceLock};

use forrit_core::Event;
use futures::{stream, Stream, StreamExt};
use tap::Pipe;

use crate::{Result, SerdeTree, TimeKey};

static EVENTS: OnceLock<SerdeTree<Event, TimeKey>> = OnceLock::new();

pub fn init_events(tree: SerdeTree<Event, TimeKey>) {
    EVENTS.set(tree).unwrap();
}

pub fn emit(event: &Event) -> Result<TimeKey> {
    EVENTS.get().unwrap().insert(event)
}

pub fn clear() -> Result<()> {
    EVENTS.get().unwrap().clear()
}

pub fn subscribe() -> Result<impl Stream<Item = (TimeKey, Event)>> {
    let tree = EVENTS.get().unwrap();
    tree.latest(10)?
        .into_iter()
        .pipe(stream::iter)
        .chain(tree.watch("").map(|(k, v)| {
            (
                TimeKey::from_be_bytes(k.deref().try_into().expect("Bad TimeKey bytes")),
                v,
            )
        }))
        .pipe(Ok)
}

#[tokio::test]
async fn test_events() {
    use tap::{Conv, Pipe, Tap};

    sled::Config::new()
        .temporary(true)
        .open()
        .unwrap()
        .open_tree("events")
        .unwrap()
        .conv::<SerdeTree<Event, TimeKey>>()
        .pipe(init_events);

    emit(&Event::DownloadStart {
        url: "https://example.com".parse().unwrap(),
    })
    .unwrap();
    emit(&Event::DownloadStart {
        url: "https://123.com".parse().unwrap(),
    })
    .unwrap();
    emit(&Event::Warn("apisjdpiasjd".into())).unwrap();
    EVENTS
        .get()
        .unwrap()
        .latest(1000)
        .unwrap()
        .tap_deref(|x| println!("{:?}", x));

    subscribe()
        .unwrap()
        .for_each(|x| async move { println!("{:?}", x) })
        .await;
}

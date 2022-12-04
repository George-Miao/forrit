use std::ops::Deref;

use forrit_core::Event;
use futures::{stream, Stream, StreamExt};
use sled::Tree;
use tap::Pipe;

use crate::{Result, SerdeTree, TimeKey};

#[derive(Debug, Clone)]
pub struct Events {
    tree: SerdeTree<Event, TimeKey>,
}

impl Events {
    pub fn new(tree: SerdeTree<Event, TimeKey>) -> Self {
        Self { tree }
    }

    pub fn subscribe(&self) -> Result<impl Stream<Item = (TimeKey, Event)>> {
        self.tree
            .latest(10)?
            .into_iter()
            .pipe(stream::iter)
            .chain(self.tree.watch("").map(|(k, v)| {
                (
                    TimeKey::from_be_bytes(k.deref().try_into().expect("Bad TimeKey bytes")),
                    v,
                )
            }))
            .pipe(Ok)
    }

    pub fn emit(&self, event: &Event) -> Result<TimeKey> {
        self.tree.insert(event)
    }

    pub fn clear(&self) -> Result<()> {
        self.tree.clear()
    }
}

impl From<Tree> for Events {
    fn from(tree: Tree) -> Self {
        Self::new(tree.into())
    }
}

#[tokio::test]
async fn test_events() {
    use tap::Tap;

    let e: Events = sled::Config::new()
        .temporary(true)
        .open()
        .unwrap()
        .open_tree("events")
        .unwrap()
        .into();

    e.emit(&Event::DownloadStart {
        url: "https://example.com".parse().unwrap(),
    })
    .unwrap();
    e.emit(&Event::DownloadStart {
        url: "https://123.com".parse().unwrap(),
    })
    .unwrap();
    e.emit(&Event::Warn("apisjdpiasjd".into())).unwrap();
    e.tree
        .latest(1000)
        .unwrap()
        .tap_deref(|x| println!("{:?}", x));
    e.subscribe()
        .unwrap()
        .for_each(|x| async move { println!("{:?}", x) })
        .await;
}

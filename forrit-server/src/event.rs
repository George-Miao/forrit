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

    pub fn subscribe(&self) -> Result<impl Stream<Item = Event>> {
        self.tree
            .latest(10)?
            .into_iter()
            .map(|(_, v)| v)
            .pipe(stream::iter)
            .chain(self.tree.watch(""))
            .pipe(Ok)
    }

    pub fn emit(&self, event: &Event) -> Result<TimeKey> {
        self.tree.insert(event)
    }
}

impl From<Tree> for Events {
    fn from(tree: Tree) -> Self {
        Self::new(tree.into())
    }
}

use std::{
    borrow::{Borrow, Cow},
    fmt::{self, Debug, Formatter},
    ops::{Deref, DerefMut},
    pin::Pin,
    sync::{
        atomic::{AtomicBool, Ordering::Relaxed},
        Arc, LazyLock,
    },
};

use color_eyre::Result;
use forrit_core::with;
use futures::{
    future::Future,
    task::{AtomicWaker, Context, Poll},
};
use nanoid::nanoid;
use regex::Regex;
use serde::{de::DeserializeOwned, Serialize};
use sled::{Batch, Tree};
use tap::Pipe;

pub fn normalize_title(title: &str) -> Cow<'_, str> {
    const EXPECT_ERR: &str = "Regex should compile";
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            Regex::new(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#)
                .expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#)
                .expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#).expect(EXPECT_ERR),
            Regex::new(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#)
                .expect(EXPECT_ERR),
        ]
    });

    PATTERNS
        .iter()
        .find_map(|pat| {
            pat.captures(title).and_then(|cap| {
                let pre = cap.get(1)?.as_str().trim();
                let episode = cap.get(2)?.as_str().trim();
                let suf = cap.get(3)?.as_str().trim();

                Some(format!("{pre} E{episode} {suf}").into())
            })
        })
        .unwrap_or_else(|| title.into())
}

#[test]
fn test_normalize_title() {
    macro_rules! eq {
        ($lhs:literal = $rhs:literal) => {
            assert_eq!(normalize_title($lhs), $rhs);
        };
    }
    eq!(
        "[愛戀字幕社&波子汽水漢化組][10月新番][四人各有小秘密][4-nin wa Sorezore Uso wo \
         Tsuku][01][1080P][MP4][BIG5][繁中]" =
            "[愛戀字幕社&波子汽水漢化組][10月新番][四人各有小秘密][4-nin wa Sorezore Uso wo \
             Tsuku] E01 [1080P][MP4][BIG5][繁中]"
    );
    eq!(
        "[jibaketa]Kanojo, Okarishimasu - 06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv" =
            "[jibaketa]Kanojo, Okarishimasu E06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv"
    );
}

struct Inner {
    waker: AtomicWaker,
    set: AtomicBool,
}

#[derive(Clone)]
pub struct Flag(Arc<Inner>);

impl Flag {
    pub fn new() -> Self {
        Self(Arc::new(Inner {
            waker: AtomicWaker::new(),
            set: AtomicBool::new(false),
        }))
    }

    pub fn signal(&self) {
        self.0.set.store(true, Relaxed);
        self.0.waker.wake();
    }
}

impl Default for Flag {
    fn default() -> Self {
        Self::new()
    }
}

impl Future for Flag {
    type Output = ();

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        // quick check to avoid registration if already done.
        if self.0.set.load(Relaxed) {
            self.0.set.store(false, Relaxed);
            return Poll::Ready(());
        }

        self.0.waker.register(cx.waker());

        // Need to check condition **after** `register` to avoid a race
        // condition that would result in lost notifications.
        if self.0.set.load(Relaxed) {
            self.0.set.store(false, Relaxed);
            Poll::Ready(())
        } else {
            Poll::Pending
        }
    }
}

impl Debug for Flag {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let val = self.0.set.load(Relaxed);
        f.debug_tuple("Flag").field(&val).finish()
    }
}

#[derive(Clone)]
pub struct SerdeTree<T> {
    tree: Tree,
    _marker: std::marker::PhantomData<T>,
}

impl<T> SerdeTree<T> {
    pub fn new(tree: Tree) -> Self {
        Self {
            tree,
            _marker: std::marker::PhantomData,
        }
    }

    pub fn get(&self, key: impl AsRef<[u8]>) -> Result<Option<T>>
    where
        T: DeserializeOwned,
    {
        self.tree
            .get(key)?
            .and_then(|v| serde_json::from_slice(&v).ok())
            .pipe(Ok)
    }

    /// Insert a value into the tree, and return the key that was used.
    pub fn insert(&self, value: &T) -> Result<String>
    where
        T: Serialize + DeserializeOwned,
    {
        let id = nanoid!();
        self.upsert(id.as_bytes(), value)?;
        Ok(id)
    }

    /// Update or insert. If update, return the old value.
    pub fn upsert(&self, key: impl AsRef<[u8]>, value: &T) -> Result<Option<T>>
    where
        T: Serialize + DeserializeOwned,
    {
        let value = serde_json::to_vec(value)?;
        match self.tree.insert(key, value)? {
            Some(res) => Ok(serde_json::from_slice(res.borrow())?),
            None => Ok(None),
        }
    }

    pub fn remove(&self, key: impl AsRef<[u8]>) -> Result<Option<T>>
    where
        T: DeserializeOwned,
    {
        let Some(res) = self.tree.remove(key)? else {
            return Ok(None);
        };
        Ok(Some(serde_json::from_slice(res.borrow())?))
    }

    pub fn remove_batch(&self, keys: impl IntoIterator<Item = impl AsRef<[u8]>>) -> Result<()>
    where
        T: DeserializeOwned,
    {
        let mut batch = Batch::default();
        for key in keys {
            batch.remove(key.as_ref());
        }
        self.tree.apply_batch(batch).map_err(Into::into)
    }

    pub fn iter(&self) -> impl Iterator<Item = Result<(String, T)>>
    where
        T: DeserializeOwned,
    {
        self.tree.iter().map(|x| {
            let (k, v) = x?;
            let v = serde_json::from_slice(v.borrow())?;
            let k = String::from_utf8(k.to_vec())?;
            Ok((k, v))
        })
    }

    pub fn iter_with_id(&self) -> impl Iterator<Item = Result<impl DeserializeOwned + Serialize>>
    where
        T: DeserializeOwned + Serialize,
    {
        self.tree.iter().map(|x| {
            let (k, v) = x?;
            let v = serde_json::from_slice::<T>(v.borrow())?;
            let id = String::from_utf8(k.to_vec())?;
            Ok(with! { id, content = v })
        })
    }
}

impl<T> Deref for SerdeTree<T> {
    type Target = Tree;

    fn deref(&self) -> &Self::Target {
        &self.tree
    }
}

impl<T> DerefMut for SerdeTree<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.tree
    }
}

impl Debug for SerdeTree<()> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("SerdeTree")
            .field("tree", &self.tree)
            .finish()
    }
}

impl<T> From<Tree> for SerdeTree<T> {
    fn from(tree: Tree) -> Self {
        Self::new(tree)
    }
}

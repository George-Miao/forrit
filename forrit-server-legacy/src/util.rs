use std::{
    borrow::{Borrow, Cow},
    fmt::{self, Debug, Formatter},
    marker::PhantomData,
    ops::{Deref, RangeBounds},
    pin::Pin,
    sync::{
        atomic::{AtomicBool, Ordering::Relaxed},
        Arc, LazyLock,
    },
    task::ready,
    time::{SystemTime, UNIX_EPOCH},
};

use actix_web::{dev::Payload, error::InternalError, FromRequest, HttpRequest};
use forrit_core::with;
use futures::{
    future::{err, ok, Future, Ready},
    task::{AtomicWaker, Context, Poll},
    Stream,
};
use nanoid::nanoid;
use regex::Regex;
use reqwest::{StatusCode, Url};
use serde::{de::DeserializeOwned, Serialize};
use sled::{Batch, IVec, Tree};
use tap::Pipe;

use crate::Result;

pub fn normalize_title(title: &str) -> Cow<'_, str> {
    macro_rules! rule {
        ($reg:literal) => {
            Regex::new($reg).expect("Regex should compile")
        };
    }
    static PATTERNS: LazyLock<[Regex; 7]> = LazyLock::new(|| {
        [
            rule!(r#"(.*)\[(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[E(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)话(?:END)?\](.*)"#),
            rule!(r#"(.*)\[第(\d*\.*\d*)話(?:END)?\](.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)话(?:END)?(.*)"#),
            rule!(r#"(.*)第(\d*\.*\d*)話(?:END)?(.*)"#),
            rule!(r#"(.*)-\s*(\d{1,3}|\d{1,3}\.\d{1,2})(?:v\d{1,2})?(?:END)? (.*)"#),
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
        "[Sakurato] Bleach-Sennen Kessen Hen [01][HEVC-10bit 1080p AAC][CHS&CHT].mkv" =
            "[Sakurato] Bleach-Sennen Kessen Hen E01 [HEVC-10bit 1080p AAC][CHS&CHT].mkv"
    );
    eq!(
        "[jibaketa]Kanojo, Okarishimasu - 06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv" =
            "[jibaketa]Kanojo, Okarishimasu E06 [BD 1920x1080 x264 AACx2 SRT TVB CHT].mkv"
    );
    eq!("
    [Lilith-Raws] Shinmai Renkinjutsushi no Tenpo Keiei - 08 [Baha][WEB-DL][1080p][AVC \
         AAC][CHT][MP4].mp4" = "[Lilith-Raws] Shinmai Renkinjutsushi no Tenpo Keiei E08 \
                                    [Baha][WEB-DL][1080p][AVC AAC][CHT][MP4].mp4");
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

pub struct SerdeTree<T, K = str>
where
    K: ?Sized,
{
    tree: Tree,
    _marker: std::marker::PhantomData<for<'a> fn(&'a K) -> T>,
}

impl<K: ?Sized, T> SerdeTree<T, K> {
    pub fn new(tree: Tree) -> Self {
        Self {
            tree,
            _marker: std::marker::PhantomData,
        }
    }

    pub fn clear(&self) -> Result<()> {
        self.tree.clear().map_err(Into::into)
    }
}

impl<K, T> SerdeTree<T, K>
where
    K: ?Sized + AsRef<[u8]>,
    T: DeserializeOwned,
{
    pub fn get(&self, key: &K) -> Result<Option<T>> {
        match self.tree.get(key)? {
            Some(b) => serde_json::from_slice(b.deref())
                .map(Some)
                .map_err(Into::into),
            None => Ok(None),
        }
    }

    /// Update or insert. If update, return the old value.
    pub fn upsert(&self, key: &K, value: &T) -> Result<Option<T>>
    where
        T: Serialize,
    {
        let value = serde_json::to_vec(value)?;
        match self.tree.insert(key, value)? {
            Some(res) => Ok(serde_json::from_slice(res.borrow())?),
            None => Ok(None),
        }
    }

    pub fn remove(&self, key: &K) -> Result<Option<T>> {
        let Some(res) = self.tree.remove(key)? else {
            return Ok(None);
        };
        Ok(Some(serde_json::from_slice(res.borrow())?))
    }

    pub fn remove_batch<R>(&'_ self, keys: impl IntoIterator<Item = R>) -> Result<()>
    where
        R: AsRef<K>,
    {
        let mut batch = Batch::default();
        keys.into_iter()
            .for_each(|key| batch.remove(key.as_ref().as_ref()));
        self.tree.apply_batch(batch).map_err(Into::into)
    }

    pub fn watch(&self, prefix: impl AsRef<[u8]>) -> impl Stream<Item = (IVec, T)> {
        SledSerdeStream::new(self.tree.watch_prefix(prefix))
    }
}

impl<T> SerdeTree<T, str> {
    /// Insert a value into the tree with a generated key, and return it.
    pub fn insert(&self, value: &T) -> Result<String>
    where
        T: Serialize + DeserializeOwned,
    {
        let id = nanoid!();
        self.upsert(&id, value)?;
        Ok(id)
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

impl SerdeTree<Url, str> {
    pub fn upsert_record(&self, sub_id: &str, torrent_id: &str, url: &Url) -> Result<()> {
        let key = format!("{}:{}", sub_id, torrent_id);
        self.upsert(key.as_ref(), url)?;
        Ok(())
    }

    pub fn find_record(&self, sub_id: &str, torrent_id: &str) -> Result<Option<Url>> {
        let key = format!("{}:{}", sub_id, torrent_id);
        self.get(&key)
    }

    pub fn remove_all(&self, sub_id: &str) -> Result<()> {
        let mut batch = Batch::default();
        self.tree.scan_prefix(sub_id.as_bytes()).try_for_each(|x| {
            let (k, _) = x?;
            batch.remove(k);
            Result::<()>::Ok(())
        })?;
        self.tree.apply_batch(batch)?;
        Ok(())
    }
}

impl<T: DeserializeOwned> SerdeTree<T, TimeKey> {
    pub fn insert(&self, value: &T) -> Result<TimeKey>
    where
        T: Serialize,
    {
        let key = TimeKey::now();
        self.upsert(&key, value)?;
        Ok(key)
    }

    pub fn iter(&self) -> impl Iterator<Item = Result<(TimeKey, T)>> + DoubleEndedIterator {
        self.range(..)
    }

    pub fn latest(&self, count: usize) -> Result<Vec<(TimeKey, T)>> {
        let mut ret = self
            .range(..)
            .rev()
            .take(count)
            .collect::<Result<Vec<_>>>()?;
        ret.reverse();
        Ok(ret)
    }

    pub fn range(
        &self,
        range: impl RangeBounds<TimeKey>,
    ) -> impl Iterator<Item = Result<(TimeKey, T)>> + DoubleEndedIterator {
        self.tree.range(range).map(|x| {
            let (k, v) = x?;
            let v = serde_json::from_slice(v.borrow())?;
            let k = TimeKey::from_be_bytes(k.deref().try_into().expect("Bad TimeKey bytes"));
            Ok((k, v))
        })
    }
}

impl<T, K: ?Sized> Debug for SerdeTree<T, K> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("SerdeTree")
            .field("tree", &self.tree)
            .finish()
    }
}

impl<T, K: ?Sized> From<Tree> for SerdeTree<T, K> {
    fn from(tree: Tree) -> Self {
        Self::new(tree)
    }
}

impl<T, K: ?Sized> Clone for SerdeTree<T, K> {
    fn clone(&self) -> Self {
        Self {
            tree: self.tree.clone(),
            _marker: self._marker,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct TimeKey([u8; 8]);

impl TimeKey {
    pub fn now() -> Self {
        Self::with_systemtime(&SystemTime::now())
    }

    pub fn with_systemtime(time: &SystemTime) -> Self {
        let time = time.duration_since(UNIX_EPOCH).unwrap();
        Self::from_micros(time.as_micros().try_into().expect("TimeKey overflow"))
    }

    pub fn timestamp(&self) -> u64 {
        u64::from_be_bytes(self.0)
    }

    pub fn from_micros(ts: u64) -> Self {
        Self(ts.to_be_bytes())
    }

    pub fn from_be_bytes(bytes: [u8; 8]) -> Self {
        Self(bytes)
    }
}

impl From<SystemTime> for TimeKey {
    fn from(time: SystemTime) -> Self {
        Self::with_systemtime(&time)
    }
}

impl From<&SystemTime> for TimeKey {
    fn from(time: &SystemTime) -> Self {
        Self::with_systemtime(time)
    }
}

impl Default for TimeKey {
    fn default() -> Self {
        Self::now()
    }
}

impl AsRef<[u8]> for TimeKey {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl<T, K> FromRequest for SerdeTree<T, K>
where
    T: 'static,
    K: ?Sized + 'static,
{
    type Error = InternalError<&'static str>;
    type Future = Ready<Result<Self, Self::Error>>;

    #[inline]
    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        if let Some(st) = req.app_data::<Self>() {
            ok(st.clone())
        } else {
            err(InternalError::new(
                "SerdeTree not found in app_data",
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}

impl FromRequest for Flag {
    type Error = InternalError<&'static str>;
    type Future = Ready<Result<Self, Self::Error>>;

    #[inline]
    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        if let Some(st) = req.app_data::<Flag>() {
            ok(st.clone())
        } else {
            err(InternalError::new(
                "SerdeTree not found in app_data",
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}

pin_project_lite::pin_project! {
    struct SledSerdeStream<T> {
        #[pin]
        receiver: sled::Subscriber,
        _marker: PhantomData<T>,
    }
}

impl<T> SledSerdeStream<T> {
    pub fn new(receiver: sled::Subscriber) -> Self {
        Self {
            receiver,
            _marker: PhantomData,
        }
    }
}

impl<T> Stream for SledSerdeStream<T>
where
    T: DeserializeOwned,
{
    type Item = (IVec, T);

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match ready!(self.project().receiver.poll(cx)) {
            Some(e) => match e {
                sled::Event::Insert { value, key } => serde_json::from_slice::<T>(value.deref())
                    .unwrap()
                    .pipe(|x| Poll::Ready(Some((key, x)))),
                _ => Poll::Pending,
            },
            None => Poll::Ready(None),
        }
    }
}

#[test]
fn test_time_key() {
    let t1 = TimeKey::from_micros(114514);
    let t2 = TimeKey::from_micros(1919810);
    let t3 = TimeKey::from_micros(120398109238091283);
    let db = sled::Config::new().temporary(true).open().unwrap();
    let tree: SerdeTree<[u8; 0], TimeKey> = db.open_tree("test").unwrap().into();
    let sub = tree.tree.watch_prefix("");
    tree.upsert(&t1, &[]).unwrap();
    tree.upsert(&t2, &[]).unwrap();
    tree.upsert(&t3, &[]).unwrap();
    let c = tree.range(TimeKey::from_micros(115000)..).count();
    assert_eq!(c, 2);
    let l = tree.latest(2).unwrap();
    assert_eq!(l, vec![(t2, []), (t3, [])]);
    sub.for_each(|x| {
        dbg!(x);
    });
}

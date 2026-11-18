use std::{
    borrow::Cow,
    collections::{HashMap, HashSet},
    sync::Arc,
    time::Duration,
};

use backon::Retryable;
use camino::Utf8PathBuf;
use forrit_config::QbittorrentConfig;
use forrit_core::{
    IntoStream,
    model::{DownloadState, WithId},
};
use futures::{StreamExt, future::try_join_all};
use mongodb::bson::oid::ObjectId;
use qbit_rs::{
    Qbit,
    model::{AddTorrentArg, Credential, GetTorrentListArg, Torrent, TorrentSource},
};
use ractor::{Actor, ActorProcessingErr, ActorRef, concurrency::JoinHandle};
use tap::Pipe;
use tracing::{debug, info, warn};

use crate::{
    downloader::{DownloadManager, Job, Message},
    util::{normalize_title, retry_backoff, timestamp},
};

pub struct QbitActor {
    qbit: Qbit,
    config: Arc<QbittorrentConfig>,
    manager: DownloadManager,
}

impl QbitActor {
    pub fn new(config: Arc<QbittorrentConfig>, manager: DownloadManager) -> Self {
        let qbit = Qbit::new(
            config.url.clone(),
            Credential::new(config.auth.username.to_owned(), config.auth.password.to_owned()),
        );

        QbitActor { qbit, config, manager }
    }
}

#[derive(Debug, Clone, Default)]
struct ActiveDownload {
    id: ObjectId,
}

impl ActiveDownload {
    fn new(id: ObjectId) -> Self {
        Self { id }
    }
}

fn missing_downloads(
    qb_torrents: &HashMap<String, String>,
    downloading: &HashMap<String, ActiveDownload>,
) -> Vec<ObjectId> {
    let present: HashSet<_> = qb_torrents.values().collect();
    downloading
        .iter()
        .filter(|(name, _)| !present.contains(name))
        .map(|(_, active)| active.id)
        .collect()
}

async fn default_save_path(qbit: &Qbit) -> Result<Utf8PathBuf, qbit_rs::Error> {
    (|| qbit.get_default_save_path())
        .retry(retry_backoff())
        .notify(|error, delay| {
            warn!(%error, ?delay, "Failed to log in to qBittorrent, retrying");
        })
        .await
        .map(|path| path.try_into().expect("Non utf-8 path"))
}

pub struct State {
    check_id: i64,
    /// Map of torrent hash to name given by qbit
    qb_torrents: HashMap<String, String>,
    /// Map of name to download job spawned by us
    downloading: HashMap<String, ActiveDownload>,
    savepath: Utf8PathBuf,
    rename_job: Option<JoinHandle<()>>,
    check_job: JoinHandle<()>,
}

impl Actor for QbitActor {
    type Arguments = ();
    type Msg = super::Message;
    type State = State;

    async fn pre_start(&self, this: ActorRef<Message>, _: Self::Arguments) -> Result<Self::State, ActorProcessingErr> {
        info!("QBit actor starting");
        let savepath = if let Some(savepath) = self.config.savepath.clone() {
            savepath
        } else {
            info!("No save path provided, using default save path");
            default_save_path(&self.qbit).await?
        };

        let rename_job = if self.manager.config.rename.enable {
            ractor::time::send_interval(self.manager.config.rename.interval, this.get_cell(), || Message::Rename)
                .pipe(Some)
        } else {
            None
        };
        let check_job = ractor::time::send_interval(self.config.check_interval, this.get_cell(), || Message::Check);

        Ok(State {
            check_id: 0,
            qb_torrents: HashMap::new(),
            downloading: HashMap::new(),
            savepath,
            rename_job,
            check_job,
        })
    }

    async fn post_start(&self, _: ActorRef<Message>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        for job in self.manager.pending_jobs().await? {
            self.download(job, state).await?;
        }

        for job in self.manager.downloading_jobs().await? {
            state.downloading.insert(job.inner.name, ActiveDownload::new(job.id));
        }

        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Message>,
        msg: Self::Msg,
        state: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        match msg {
            Message::NewDownloadAdded(id) => {
                let job = self.load_job(id).await?;
                if let Some(job) = job {
                    self.download(job, state).await?;
                } else {
                    warn!(%id, "Job not found");
                };
            }
            Message::Rename => self.rename().await,
            Message::Check => self.check(state).await?,
        }
        Ok(())
    }

    async fn post_stop(&self, _: ActorRef<Self::Msg>, state: &mut Self::State) -> Result<(), ActorProcessingErr> {
        info!("QBit actor stopping");
        if let Some(ref handle) = state.rename_job {
            handle.abort()
        }
        state.check_job.abort();
        Ok(())
    }
}

impl QbitActor {
    async fn download(&self, job: WithId<Job>, state: &mut State) -> Result<(), ActorProcessingErr> {
        let (id, job) = job.split();
        let Some(prepared) = self.manager.prepare(job).await? else {
            self.manager.update_state(id, DownloadState::Failed).await?;
            return Ok(());
        };

        let url = prepared.entry.inner.base.torrent;
        let path = state.savepath.join(prepared.path);

        let res = (|| {
            let arg = AddTorrentArg::builder()
                .source(TorrentSource::Urls {
                    urls: vec![url.clone()].into(),
                })
                .savepath(path.to_string())
                .build();
            self.qbit.add_torrent(arg)
        })
        .retry(retry_backoff())
        .notify(|error, delay| {
            warn!(%error, ?delay, %id, "Failed to add torrent, retrying");
        })
        .await;

        res?;
        self.manager.update_state(id, DownloadState::Downloading).await?;
        state
            .downloading
            .insert(prepared.download.name, ActiveDownload::new(id));

        Ok(())
    }

    async fn load_job(&self, id: ObjectId) -> Result<Option<WithId<Job>>, ActorProcessingErr> {
        (|| self.manager.jobs.get_one(id))
            .retry(retry_backoff())
            .notify(|error, delay| {
                warn!(%error, ?delay, %id, "Failed to load download job, retrying");
            })
            .await
            .map_err(Into::into)
    }

    async fn check(&self, state: &mut State) -> Result<(), ActorProcessingErr> {
        let check_id = state.check_id;
        let maindata = (|| self.qbit.sync(check_id))
            .retry(retry_backoff())
            .notify(|error, delay| {
                warn!(%error, ?delay, "Failed to check download status, retrying");
            })
            .await?;
        state.check_id = maindata.rid;
        if maindata.full_update == Some(true) {
            state.qb_torrents.clear();
        }

        for hash in maindata.torrents_removed.into_iter().flatten() {
            state.qb_torrents.remove(&hash);
        }

        let iter = maindata.torrents.into_iter().flat_map(|x| x.into_iter());

        for (hash, torrent) in iter {
            let name: &String = if let Some(name) = torrent.name {
                state.qb_torrents.entry(hash).insert_entry(name).into_mut()
            } else if let Some(name) = state.qb_torrents.get(&hash) {
                name
            } else {
                continue;
            };
            let Some(active) = state.downloading.get(name) else {
                continue;
            };

            use qbit_rs::model::State::*;
            let terminal = match torrent.state {
                Some(Error | MissingFiles) => DownloadState::Failed,
                Some(Uploading | PausedUP | QueuedUP | StalledUP | CheckingUP | ForcedUP) => DownloadState::Finished,
                _ => continue,
            };
            self.manager.update_state(active.id, terminal).await?;
            state.downloading.remove(name);
        }

        for id in missing_downloads(&state.qb_torrents, &state.downloading) {
            let Some(job) = self.load_job(id).await? else {
                warn!(%id, "Downloading job no longer exists");
                state.downloading.retain(|_, active| active.id != id);
                continue;
            };
            if job.state != DownloadState::Downloading {
                state.downloading.retain(|_, active| active.id != id);
                continue;
            }
            warn!(%id, "Download is missing from qBittorrent, resubmitting");
            self.download(job, state).await?;
        }

        Ok(())
    }

    fn should_rename(&self, torrent: &Torrent) -> bool {
        const ONE_HOUR: Duration = Duration::from_secs(3600);
        (|| {
            let added = timestamp(torrent.added_on? as _)
                .elapsed()
                .unwrap_or_else(|_| Duration::from_secs(0));
            Some(added < ONE_HOUR)
        })()
        .unwrap_or(false)
    }

    async fn rename(&self) {
        let res = GetTorrentListArg::builder()
            .sort("added_on".to_owned())
            .limit(100)
            .reverse(true)
            .build()
            .pipe(|arg| self.qbit.get_torrent_list(arg))
            .await;
        let list = match res {
            Ok(list) => list,
            Err(error) => {
                warn!(%error, "Failed to get torrent list");
                return;
            }
        };
        list.into_iter()
            .filter_map(|x| self.should_rename(&x).then_some(x.hash?))
            .into_stream()
            .for_each_concurrent(None, |hash| async move {
                if let Err(error) = self.rename_one(&hash).await {
                    warn!(%hash, %error, "Failed to rename torrent");
                }
            })
            .await;
    }

    async fn rename_one(&self, hash: &str) -> Result<(), qbit_rs::Error> {
        let files = self.qbit.get_torrent_contents(&hash, None).await?;
        if files.is_empty() {
            debug!("Did not find any files to rename");
            return Ok(());
        }
        files
            .into_iter()
            .filter_map(|x| {
                let old = &x.name;
                if let Cow::Owned(new) = normalize_title(old, &self.manager.config.rename.format) {
                    info!("Renaming qbit file {old} -> {new}");
                    Some((x.name, new))
                } else {
                    debug!("Skip renaming qbit file {old}");
                    None
                }
            })
            .map(|(old, new)| async { self.qbit.rename_file(&hash, old, new).await })
            .pipe(try_join_all)
            .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::{collections::HashMap, time::Duration};

    use camino::Utf8PathBuf;
    use mongodb::bson::oid::ObjectId;
    use qbit_rs::{Qbit, model::Credential};
    use tokio::{
        io::{AsyncReadExt, AsyncWriteExt},
        net::TcpListener,
    };
    use url::Url;

    use super::{ActiveDownload, default_save_path, missing_downloads};

    async fn respond(listener: &TcpListener, status: &str, header: Option<&str>, body: &str) -> String {
        let (mut stream, _) = listener.accept().await.unwrap();
        let mut request = Vec::new();
        loop {
            let mut chunk = [0; 1024];
            let read = stream.read(&mut chunk).await.unwrap();
            if read == 0 {
                break;
            }
            request.extend_from_slice(&chunk[..read]);
            if request.windows(4).any(|window| window == b"\r\n\r\n") {
                break;
            }
        }

        let header = header.map_or_else(String::new, |header| format!("{header}\r\n"));
        let response = format!(
            "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n{header}\r\n{body}",
            body.len(),
        );
        stream.write_all(response.as_bytes()).await.unwrap();
        String::from_utf8(request).unwrap()
    }

    fn qbit(address: std::net::SocketAddr) -> Qbit {
        Qbit::new(
            Url::parse(&format!("http://{address}")).unwrap(),
            Credential::new("user", "password"),
        )
    }

    #[tokio::test]
    async fn retries_failed_login_before_loading_default_save_path() {
        let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
        let address = listener.local_addr().unwrap();
        let server = tokio::spawn(async move {
            let request = respond(&listener, "403 Forbidden", None, "").await;
            assert!(request.starts_with("POST /api/v2/auth/login "));

            let request = respond(&listener, "200 OK", Some("Set-Cookie: SID=test"), "Ok.").await;
            assert!(request.starts_with("POST /api/v2/auth/login "));

            let request = respond(&listener, "200 OK", None, "/downloads").await;
            assert!(request.starts_with("GET /api/v2/app/defaultSavePath "));
        });

        let path = tokio::time::timeout(Duration::from_secs(20), default_save_path(&qbit(address)))
            .await
            .expect("qBittorrent login retry timed out")
            .expect("qBittorrent login should recover");

        assert_eq!(path, Utf8PathBuf::from("/downloads"));
        server.await.unwrap();
    }

    #[tokio::test]
    async fn stops_retrying_login_after_four_attempts() {
        let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
        let address = listener.local_addr().unwrap();
        let server = tokio::spawn(async move {
            for _ in 0..4 {
                let request = respond(&listener, "403 Forbidden", None, "").await;
                assert!(request.starts_with("POST /api/v2/auth/login "));
            }
        });

        let result = tokio::time::timeout(Duration::from_secs(20), default_save_path(&qbit(address)))
            .await
            .expect("qBittorrent login retries timed out");

        assert!(result.is_err());
        server.await.unwrap();
    }

    #[test]
    fn identifies_downloading_jobs_missing_from_qbittorrent() {
        let present = ObjectId::new();
        let missing = ObjectId::new();
        let qb_torrents = HashMap::from([("hash".to_owned(), "present".to_owned())]);
        let downloading = HashMap::from([
            ("present".to_owned(), ActiveDownload::new(present)),
            ("missing".to_owned(), ActiveDownload::new(missing)),
        ]);

        assert_eq!(missing_downloads(&qb_torrents, &downloading), vec![missing]);
    }

    #[tokio::test]
    #[ignore = "requires an isolated MongoDB instance via FORRIT_TEST_MONGODB_URL"]
    async fn resubmits_only_missing_active_downloads_after_qbittorrent_resets_sync() {
        use std::sync::Arc;

        use forrit_config::{Auth, DownloaderConfig, DownloaderType, QbittorrentConfig, RenameConfig};
        use forrit_core::model::{Download, EntryBase, PartialEntry};

        use super::{DownloadManager, DownloadState, Job, QbitActor, State};
        use crate::db::Storage;

        let url = std::env::var("FORRIT_TEST_MONGODB_URL").unwrap();
        let client = mongodb::Client::with_uri_str(url).await.unwrap();
        let db = client.database(&format!("forrit_test_{}", ObjectId::new().to_hex()));
        let listener = TcpListener::bind(("127.0.0.1", 0)).await.unwrap();
        let config = QbittorrentConfig {
            url: Url::parse(&format!("http://{}", listener.local_addr().unwrap())).unwrap(),
            auth: Auth {
                username: "test".into(),
                password: "test".into(),
            },
            check_interval: Duration::from_secs(60),
            savepath: Some("/downloads".into()),
        };
        let manager = DownloadManager {
            jobs: Storage::new(db.collection("job")).await.unwrap(),
            entry: Storage::new(db.collection("entry")).await.unwrap(),
            config: Arc::new(DownloaderConfig {
                rename: RenameConfig::default(),
                ty: DownloaderType::Qbittorrent(config.clone()),
            }),
        };
        let entry = manager
            .entry
            .insert(PartialEntry {
                base: EntryBase {
                    sourcer: "test".into(),
                    guid: "missing".into(),
                    title: "missing".into(),
                    description: None,
                    torrent: Url::parse("http://127.0.0.1/torrent").unwrap(),
                    info_hash: "hash-missing".into(),
                    torrent_name: "missing".into(),
                    size: 1,
                    mime_type: "application/x-bittorrent".into(),
                    pub_date: None,
                    link: None,
                    group: None,
                    elements: Default::default(),
                },
                meta_title: None,
                meta_id: None,
            })
            .await
            .unwrap();
        let new_job = |name: &str| Job {
            name: name.into(),
            state: DownloadState::Downloading,
            download: Download {
                entry_id: entry.id,
                meta_id: None,
                subscription_id: None,
                directory_override: None,
            },
        };
        let missing = manager.jobs.insert(new_job("missing")).await.unwrap();
        let finished = manager.jobs.insert(new_job("finished")).await.unwrap();
        let actor = QbitActor::new(Arc::new(config), manager);
        let mut state = State {
            check_id: 3,
            qb_torrents: HashMap::from([("hash-missing".into(), "missing".into())]),
            downloading: HashMap::from([
                ("missing".into(), ActiveDownload::new(missing.id)),
                ("finished".into(), ActiveDownload::new(finished.id)),
            ]),
            savepath: "/downloads".into(),
            rename_job: None,
            check_job: tokio::spawn(std::future::pending()),
        };
        let server = tokio::spawn(async move {
            respond(&listener, "200 OK", Some("Set-Cookie: SID=test"), "Ok.").await;
            let snapshot = respond(
                &listener,
                "200 OK",
                None,
                r#"{"rid":17,"full_update":true,"torrents":{"hash-finished":{"name":"finished","state":"uploading"}}}"#,
            )
            .await;
            assert!(snapshot.starts_with("GET /api/v2/sync/maindata?rid=3 "));
            let add = respond(&listener, "200 OK", None, "Ok.").await;
            assert!(add.starts_with("POST /api/v2/torrents/add "));
            let delta = respond(&listener, "200 OK", None,
                r#"{"rid":18,"torrents_removed":["hash-finished"],"torrents":{"hash-missing":{"name":"missing","state":"downloading"}}}"#).await;
            assert!(delta.starts_with("GET /api/v2/sync/maindata?rid=17 "));
        });

        tokio::time::timeout(Duration::from_secs(10), async {
            actor.check(&mut state).await.unwrap();
            actor.check(&mut state).await.unwrap();
            server.await.unwrap();
        })
        .await
        .unwrap();
        assert_eq!(
            actor.load_job(missing.id).await.unwrap().unwrap().state,
            DownloadState::Downloading
        );
        assert_eq!(
            actor.load_job(finished.id).await.unwrap().unwrap().state,
            DownloadState::Finished
        );
        state.check_job.abort();
        db.drop().await.unwrap();
    }
}

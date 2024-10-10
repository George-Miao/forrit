use core::hash::Hash;
use std::{
    hash::{DefaultHasher, Hasher},
    io,
    net::SocketAddr,
    path::Path,
    process::Stdio,
};

use forrit_config::{camino::Utf8PathBuf, WebUIConfig};
use include_dir::{include_dir, Dir, DirEntry};
use serde::{Deserialize, Serialize};
use tap::Tap;
use temp_dir::TempDir;

/// Where the WebUI files live.
#[derive(Debug, PartialEq, Eq)]
enum Place {
    Temp { leak: bool, dir: Option<TempDir> },
    Path(Utf8PathBuf),
}

impl Place {
    fn temp() -> io::Result<Self> {
        let dir = TempDir::new()?;
        Ok(Place::Temp {
            leak: false,
            dir: Some(dir),
        })
    }

    async fn path(path: Utf8PathBuf) -> io::Result<Self> {
        tokio::fs::create_dir_all(&path).await?;
        Ok(Place::Path(path))
    }

    fn dir(&self) -> &Path {
        match self {
            Place::Temp { dir, .. } => dir.as_ref().unwrap().path(),
            Place::Path(path) => path.as_ref(),
        }
    }

    fn set_keep_files(&mut self, keep: bool) {
        if let Place::Temp { leak, .. } = self {
            *leak = keep;
        }
    }
}

impl Drop for Place {
    fn drop(&mut self) {
        if let Place::Temp { leak, dir } = self {
            if *leak {
                dir.take().unwrap().leak();
            }
        }
    }
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize)]
struct Persistent {
    dir: Utf8PathBuf,
}

#[derive(Debug)]
pub struct WebUI {
    place: Place,
    listen: SocketAddr,
}

impl WebUI {
    pub async fn new(config: WebUIConfig) -> io::Result<Self> {
        assert!(config.enable, "WebUI is disabled");

        let mut place = match config.directory {
            Some(path) => Place::path(path).await?,
            None => Place::temp()?,
        };

        place.set_keep_files(config.keep_files);

        Ok(WebUI {
            place,
            listen: config.listen,
        })
    }

    async fn extract_dir(dir: &Path, entry: &Dir<'static>) -> io::Result<()> {
        tokio::fs::create_dir_all(&dir).await?;

        for entry in entry.entries() {
            let path = dir.join(entry.path());

            match entry {
                DirEntry::Dir(d) => {
                    tokio::fs::create_dir_all(&path).await?;
                    Box::pin(Self::extract_dir(&path, d)).await?;
                }
                DirEntry::File(f) => {
                    tokio::fs::write(path, f.contents()).await?;
                }
            }
        }

        Ok(())
    }

    pub async fn extract(&self) -> io::Result<()> {
        let dir = self.place.dir();
        let build = dir.join("build");

        Self::extract_dir(&build, Self::artifact()).await?;

        tokio::fs::write(dir.join("package.json"), Self::package_json()).await
    }

    pub fn install(&self) -> io::Result<tokio::process::Child> {
        tokio::process::Command::new("npm")
            .args(["install", "--progress=false", "--force"]) // react-swr-infinite-scroll is broken, so we need to force install
            .current_dir(self.place.dir())
            .kill_on_drop(true)
            .stderr(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
    }

    pub fn run(&self) -> io::Result<tokio::process::Child> {
        tokio::process::Command::new("npm")
            .args(["run", "start"])
            .env("PORT", self.listen.port().to_string())
            .env("HOST", self.listen.ip().to_string())
            .current_dir(self.place.dir())
            .kill_on_drop(true)
            .stderr(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
    }

    pub fn path(&self) -> &Path {
        self.place.dir()
    }

    /// Hash of the WebUI files.
    pub fn hash() -> u64 {
        fn hash_entry(hasher: &mut DefaultHasher, entry: &DirEntry) {
            match entry {
                DirEntry::Dir(dir) => dir.entries().iter().for_each(|ent| hash_entry(hasher, ent)),
                DirEntry::File(file) => {
                    hasher.write(file.path().as_os_str().as_encoded_bytes());
                    hasher.write(file.contents())
                }
            }
        }

        Self::artifact()
            .entries()
            .iter()
            .fold(DefaultHasher::new(), |mut hasher, ent| {
                hash_entry(&mut hasher, ent);
                hasher
            })
            .tap_mut(|hasher| Self::package_json_raw().hash(hasher))
            .finish()
    }

    fn artifact() -> &'static Dir<'static> {
        static BUILD: Dir = include_dir!("$CARGO_MANIFEST_DIR/../../frontend/build");

        &BUILD
    }

    fn package_json_raw() -> &'static str {
        static PACKAGE_JSON: &str = include_str!("../../../frontend/package.json");
        PACKAGE_JSON
    }

    fn package_json() -> String {
        const TO_REMOVE: &str = "\"forrit-client\": \"file:../clients/typescript\",\n";
        Self::package_json_raw().replace(TO_REMOVE, "")
    }
}

#[cfg(test)]
mod test {
    use std::{io, time::Instant};

    use forrit_config::WebUIConfig;
    use tokio::{
        io::{AsyncBufReadExt, BufReader},
        process::Child,
    };

    async fn log_child(mut child: Child) -> io::Result<()> {
        let mut stdout = BufReader::new(child.stdout.take().unwrap()).lines();

        while let Some(line) = stdout.next_line().await? {
            println!("{line}");
        }

        Ok(())
    }

    #[tokio::test]
    async fn test_webui() {
        let config = WebUIConfig {
            enable: true,
            directory: None,
            keep_files: true,
            listen: "0.0.0.0:80".parse().unwrap(),
        };

        let now = Instant::now();
        let webui = super::WebUI::new(config).await.unwrap();
        println!("{:?}, passed {:?}", webui.path(), now.elapsed());

        let now = Instant::now();
        webui.extract().await.unwrap();
        println!("Extracted, passed {:?}", now.elapsed());

        println!("installing...");
        let c = webui.install().unwrap();

        log_child(c).await.unwrap();

        println!("running...");
        let c = webui.run().unwrap();
        log_child(c).await.unwrap();
    }
}

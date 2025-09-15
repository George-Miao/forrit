use forrit_client::ForritClient;
use futures::StreamExt;
use tokio::io::AsyncWriteExt;

const CONF: &str = r#"
[resolver.index]
enable = true

[downloader]
type = "qbittorrent"

[downloader.rename]
enable = false

[api]
bind = "127.0.0.1:11451"
"#;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // dotenvy::dotenv().ok();
    // let dir = tempfile::tempdir()?;
    // let path = dir.path().join("config.toml");

    // let mut file = tokio::fs::File::create(&path).await?;
    // file.write_all(CONF.as_bytes()).await?;
    // drop(file);

    // let path_str = path.to_str().unwrap();
    // let mut server = tokio::process::Command::new("cargo")
    //     .args(["run", "-p", "forrit-server", "--release", "--", path_str])
    //     .spawn()?;

    // tokio::time::sleep(std::time::Duration::from_secs(3)).await;

    // let client = ForritClient::new("http://127.0.0.1:11451").unwrap();

    // let mut index_upd = client.index().subscribe().await.unwrap();
    // let job = tokio::spawn(async move {
    //     while let Some(upd) = index_upd.next().await {
    //         println!("{:?}", upd);
    //     }
    // });

    // let entries = client.entry().list().await.unwrap();
    // let first = entries.first().unwrap();
    // let entry = client.entry().get(first.id).await.unwrap();
    // assert_eq!(&entry, first);

    // job.await.unwrap();

    // server.kill().await?;

    Ok(())
}

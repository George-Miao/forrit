#![feature(never_type)]

use std::{env, path::PathBuf};

use color_eyre::{
    eyre::{ensure, eyre},
    Result,
};
use forrit::{bangumi_moe, get_config, load_config, main_loop, validate_config};
use tap::Tap;
use tokio::fs;
use tracing::{info, metadata::LevelFilter};
use tracing_subscriber::{self as ts};
use transmission_rpc::{types as tt, SharableTransClient};
use ts::EnvFilter;

#[tokio::main]
async fn main() -> Result<!> {
    ts::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .with_env_var("FORRIT_LOG")
                .from_env_lossy(),
        )
        .init();
    color_eyre::install()?;

    let conf_path = env::args().nth(1).map(PathBuf::from).unwrap_or_else(|| {
        dirs::config_dir()
            .expect("Unable to find config dir")
            .join("forrit/config.toml")
            .tap(|dir| {
                info!("Using default config path: {}", dir.display());
            })
    });
    ensure!(conf_path.exists(), "`{}` not found", conf_path.display());

    load_config(conf_path).await?;

    let (api, req, tran) = {
        let conf = &*get_config().await;

        fs::create_dir_all(&conf.data_dir).await?;
        fs::create_dir_all(&conf.download_dir).await?;

        let req = reqwest::Client::new();

        let api = bangumi_moe::Api::new_raw(&conf.bangumi_moe_domain, req.clone());

        validate_config(&api).await?;

        let mut tran =
            SharableTransClient::new_with_client(conf.transmission_url.clone(), req.clone());
        if let Some((user, password)) = conf.transmission_auth.clone() {
            tran.set_auth(tt::BasicAuth { user, password })
        };

        let res = tran.session_get().await.map_err(|e| eyre!(e))?;
        ensure!(res.is_ok(), "Unable to call transmission rpc");

        (api, req, tran)
    };

    let handle = tokio::spawn(main_loop(api, req, tran));

    handle.await.map_err(Into::into)
}

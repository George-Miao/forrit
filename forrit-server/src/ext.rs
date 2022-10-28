use std::fmt::{Debug, Display};

use color_eyre::Result;
use forrit_core::Job;
use tap::TapFallible;
use tracing::{debug, info, warn};
use transmission_rpc::types as tt;

pub trait TorrentExt {
    fn id(&self) -> Option<tt::Id>;
}

impl TorrentExt for tt::Torrent {
    fn id(&self) -> Option<tt::Id> {
        self.id
            .map(tt::Id::Id)
            .or_else(|| self.hash_string.clone().map(tt::Id::Hash))
    }
}

pub trait TapErrExt {
    fn warn_err(self) -> Self;
    fn warn_err_with(self, msg: impl Display) -> Self;
    fn warn_err_dbg(self, msg: impl Display) -> Self;

    fn warn_err_end(self)
    where
        Self: Sized,
    {
        self.warn_err();
    }

    fn warn_err_with_end(self, msg: impl Display)
    where
        Self: Sized,
    {
        self.warn_err_with(msg);
    }

    fn warn_err_dbg_end(self, msg: impl Display)
    where
        Self: Sized,
    {
        self.warn_err_dbg(msg);
    }
}

impl<T: TapFallible> TapErrExt for T
where
    T::Err: Display,
{
    fn warn_err(self) -> Self {
        self.tap_err(|error| warn!(%error))
    }

    fn warn_err_with(self, msg: impl Display) -> Self {
        self.tap_err(|error| warn!(%error, "{msg}"))
    }

    fn warn_err_dbg(self, msg: impl Display) -> Self {
        self.tap_err_dbg(|error| warn!(%error, "{msg}"))
    }
}

pub trait TapOkExt {
    fn debug_ok(self) -> Self;
    fn debug_ok_with(self, msg: impl Display) -> Self;
    fn debug_ok_dbg(self, msg: impl Display) -> Self;

    fn info_ok(self) -> Self;
    fn info_ok_with(self, msg: impl Display) -> Self;
    fn info_ok_dbg(self, msg: impl Display) -> Self;
}

impl<T: TapFallible> TapOkExt for T
where
    T::Ok: Debug,
{
    fn debug_ok(self) -> Self {
        self.tap_ok(|val| debug!(?val))
    }

    fn debug_ok_with(self, msg: impl Display) -> Self {
        self.tap_ok(|val| debug!(?val, "{msg}"))
    }

    fn debug_ok_dbg(self, msg: impl Display) -> Self {
        self.tap_ok_dbg(|val| debug!(?val, "{msg}"))
    }

    fn info_ok(self) -> Self {
        self.tap_ok(|val| info!(?val))
    }

    fn info_ok_with(self, msg: impl Display) -> Self {
        self.tap_ok(|val| info!(?val, "{msg}"))
    }

    fn info_ok_dbg(self, msg: impl Display) -> Self {
        self.tap_ok_dbg(|val| info!(?val, "{msg}"))
    }
}

pub trait JobExt {
    type Error;
    fn try_into_transmission(self) -> std::result::Result<tt::TorrentAddArgs, Self::Error>;
}

impl JobExt for Job {
    type Error = color_eyre::Report;

    fn try_into_transmission(self) -> Result<tt::TorrentAddArgs> {
        Ok(tt::TorrentAddArgs {
            filename: Some(self.url.to_string()),
            download_dir: Some(
                self.dir
                    .into_os_string()
                    .into_string()
                    .expect("Download dir should be valid utf-8"),
            ),
            ..Default::default()
        })
    }
}

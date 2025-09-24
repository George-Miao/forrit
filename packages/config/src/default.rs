pub const fn enable() -> bool {
    true
}

pub mod resolver {
    use std::num::NonZeroU32;

    pub const fn tmdb_rate_limit() -> NonZeroU32 {
        NonZeroU32::new(40).unwrap()
    }

    pub mod index {
        use std::time::Duration;

        use crate::{IndexConfig, default::enable};

        impl Default for IndexConfig {
            fn default() -> Self {
                Self {
                    enable: enable(),
                    start_at_begin: start_at_begin(),
                    interval: interval(),
                }
            }
        }

        pub const fn start_at_begin() -> bool {
            true
        }

        pub const fn interval() -> Duration {
            Duration::from_secs(7 * 24 * 60 * 60)
        }
    }
}

pub mod database {
    pub fn url() -> String {
        "mongodb://localhost:27017".to_owned()
    }

    pub fn database() -> String {
        "forrit".to_owned()
    }
}

pub mod sourcer {
    pub mod rss {
        use std::time::Duration;

        use crate::MINUTE;

        pub fn update_interval() -> Duration {
            5 * MINUTE
        }

        pub const fn deny_non_torrent() -> bool {
            false
        }
    }
}

pub mod downloader {
    use crate::{RenameConfig, RenameFormat};

    pub mod rename {
        use std::time::Duration;

        use crate::MINUTE;

        pub fn interval() -> Duration {
            5 * MINUTE
        }
    }

    impl Default for RenameConfig {
        fn default() -> Self {
            Self {
                enable: true,
                interval: rename::interval(),
                format: RenameFormat::default(),
            }
        }
    }

    pub mod transmission {
        pub fn url() -> url::Url {
            "http://localhost:9091/transmission/rpc".parse().expect("invalid url")
        }
    }

    pub mod qbittorrent {
        use std::time::Duration;

        pub const fn check_interval() -> Duration {
            Duration::from_secs(3)
        }

        pub fn url() -> url::Url {
            "http://localhost:8080/".parse().expect("invalid url")
        }
    }
}

pub mod http {
    use std::net::SocketAddr;

    use crate::{ApiDocConfig, HTTPAuthConfig, HTTPConfig};

    impl Default for HTTPConfig {
        fn default() -> Self {
            Self {
                enable: super::enable(),
                webui: super::enable(),
                log: log(),
                bind: bind(),
                debug: debug(),
                doc: ApiDocConfig::default(),
                auth: HTTPAuthConfig::default(),
            }
        }
    }

    pub const fn log() -> bool {
        false
    }

    pub fn bind() -> SocketAddr {
        "0.0.0.0:8080".parse().expect("invalid address")
    }

    pub const fn debug() -> bool {
        cfg!(debug_assertions)
    }

    pub mod apidoc {
        use camino::Utf8PathBuf;

        use crate::ApiDocConfig;

        impl Default for ApiDocConfig {
            fn default() -> Self {
                Self {
                    enable: crate::default::enable(),
                    path: path(),
                }
            }
        }

        pub fn path() -> Utf8PathBuf {
            "/api-doc".into()
        }
    }
}

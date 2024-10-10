pub const fn enable() -> bool {
    true
}
pub mod resolver {
    use std::num::NonZeroU32;

    pub fn tmdb_rate_limit() -> NonZeroU32 {
        NonZeroU32::new(40).unwrap()
    }

    pub mod index {
        use std::time::Duration;

        use crate::{default::enable, IndexConfig};

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

pub mod api {
    use std::net::SocketAddr;

    use crate::{ApiConfig, ApiDocConfig};

    impl Default for ApiConfig {
        fn default() -> Self {
            Self {
                enable: super::enable(),
                log: log(),
                bind: bind(),
                debug: debug(),
                doc: ApiDocConfig::default(),
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

    pub mod doc {
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

pub mod webui {
    use std::net::{IpAddr, Ipv4Addr, SocketAddr};

    use crate::WebUIConfig;

    impl WebUIConfig {
        #[must_use]
        pub const fn new() -> Self {
            Self {
                enable: super::enable(),
                listen: listen(),
                directory: None,
                keep_files: keep_files(),
            }
        }
    }

    impl Default for WebUIConfig {
        fn default() -> Self {
            Self::new()
        }
    }

    pub const fn keep_files() -> bool {
        true
    }

    pub const fn listen() -> SocketAddr {
        SocketAddr::new(IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)), 3000)
    }
}

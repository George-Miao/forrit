pub fn enable() -> bool {
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

        pub fn start_at_begin() -> bool {
            true
        }

        pub fn interval() -> Duration {
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

        pub fn deny_non_torrent() -> bool {
            false
        }
    }
}

pub mod downloader {
    use crate::RenameConfig;

    pub mod rename {
        use std::time::Duration;

        use crate::MINUTE;

        pub fn interval() -> Duration {
            5 * MINUTE
        }
    }

    impl Default for RenameConfig {
        fn default() -> Self {
            RenameConfig {
                enable: true,
                interval: rename::interval(),
                format: Default::default(),
            }
        }
    }

    pub mod transmission {
        pub fn url() -> url::Url {
            "http://localhost:9091/transmission/rpc".parse().expect("invalid url")
        }
    }

    pub mod qbittorrent {
        pub fn url() -> url::Url {
            "http://localhost:8080/".parse().expect("invalid url")
        }
    }
}

pub mod api {
    use std::net::SocketAddr;

    use crate::ApiConfig;

    impl Default for ApiConfig {
        fn default() -> Self {
            Self {
                enable: super::enable(),
                bind: bind(),
                debug: debug(),
            }
        }
    }

    pub fn bind() -> SocketAddr {
        "0.0.0.0:8080".parse().expect("invalid address")
    }

    pub fn debug() -> bool {
        cfg!(debug_assertions)
    }
}

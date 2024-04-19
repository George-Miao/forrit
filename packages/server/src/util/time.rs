use std::time::{Duration, SystemTime};

pub fn timestamp(sec: u64) -> SystemTime {
    SystemTime::UNIX_EPOCH + Duration::from_secs(sec)
}

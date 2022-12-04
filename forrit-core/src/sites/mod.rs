use std::path::Path;

use crate::Job;

pub trait Site {
    const NAME: &'static str;

    type Error: std::error::Error;

    type Sub;

    async fn validate(&self, sub: &Self::Sub) -> Result<bool, Self::Error>;

    async fn update<'a>(&'a self, ctx: SiteCtx<'a, Self::Sub>) -> Result<Vec<Job>, Self::Error>;
}

pub struct SiteCtx<'a, Sub> {
    pub sub: &'a Sub,
    pub download_dir: &'a Path,
}

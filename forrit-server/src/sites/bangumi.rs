use bangumi::{endpoints::SearchTorrents, rustify::Client, Endpoint};
use forrit_core::{BangumiSubscription, Job, Site, SiteCtx};
use tap::TapFallible;
use tracing::{debug, warn};
use url::Url;

#[derive(Debug, Clone)]
pub struct Bangumi {
    client: Client,
}

impl Bangumi {
    pub fn new() -> Self {
        Self {
            client: Client::default(bangumi::DEFAULT_DOMAIN),
        }
    }

    pub fn new_with_req(req: reqwest::Client) -> Self {
        Self {
            client: Client::new(bangumi::DEFAULT_DOMAIN, req),
        }
    }
}

impl Default for Bangumi {
    fn default() -> Self {
        Self::new()
    }
}

impl Site for Bangumi {
    type Error = bangumi::rustify::errors::ClientError;
    type Id = bangumi::Id;
    type Sub = BangumiSubscription;

    const NAME: &'static str = "bangumi.moe";

    async fn update(
        &self,
        ctx: SiteCtx<'_, BangumiSubscription>,
    ) -> Result<Vec<Job<Self::Id>>, Self::Error> {
        let SiteCtx { sub, download_dir } = ctx;

        let torrents = SearchTorrents::builder()
            .tags(sub.tags().map(|x| x.0.to_owned()).collect::<Vec<_>>())
            .build()
            .exec(&self.client)
            .await?
            .parse()?
            .torrents;

        let name = &sub.bangumi.name;
        let season = sub.season.unwrap_or(1);
        let dir = download_dir.join(format!("{name}/S{season}"));

        debug!(?torrents);

        let jobs = torrents
            .into_iter()
            .filter_map(|torrent| {
                let id = torrent.id;
                let filename = torrent.title;

                let url = Url::parse(&torrent.magnet)
                    .tap_err(|error| {
                        warn!(
                            ?error,
                            "Excluded because failed to parse url ({})", torrent.magnet
                        )
                    })
                    .ok()?;

                if let Some(ref exclude) = sub.exclude_pattern && exclude.is_match(&filename) {
                        debug!(filename, "Excluded because exclude pattern matches");
                        None?
                }

                if let Some(ref include) = sub.include_pattern && !include.is_match(&filename) {
                        debug!(filename, "Excluded because include pattern does not match");
                        None?
                }

                Some(Job {
                    id,
                    url,
                    dir: dir.clone(),
                })
            })
            .collect();

        Ok(jobs)
    }
}

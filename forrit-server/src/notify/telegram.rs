use std::{borrow::Cow, fmt::Debug};

use color_eyre::Result;
use forrit_core::{
    futures::{StreamExt, TryStreamExt},
    IntoStream,
};
use ractor::{Actor, ActorProcessingErr, ActorRef};
use reqwest::{header, Url};
use tap::{Pipe, Tap, TapFallible};
use telegram_bot_raw_ars::{
    Body, ChatId, HttpResponse, ParseMode, Request, ResponseType, SendMessage,
};

use crate::{Link, Notification, NotificationChunk, TelegramConfig, HTTP_CLIENT};

pub struct Telegram {
    config: TelegramConfig,
    client: reqwest::Client,
}

impl Telegram {
    pub fn new(config: TelegramConfig) -> Self {
        Self {
            config,
            client: HTTP_CLIENT.clone(),
        }
    }

    fn format(&self, notification: Notification) -> String {
        notification
            .chunks
            .into_iter()
            .map(|chunk| match chunk {
                NotificationChunk::Paragraph {
                    title,
                    title_url,
                    content,
                } => {
                    let title_formatted: Cow<str> = match title_url {
                        Some(url) => format!(r#"<a href="{url}">{title}</a>"#).into(),
                        None => title.into(),
                    };
                    format!("<b>{title_formatted}</b>\n\n{content}")
                }
                NotificationChunk::Plain { content } => content,
                NotificationChunk::Links(links) => links
                    .iter()
                    .map(|link| {
                        let Link { url, display } = link;
                        match &display {
                            Some(display) => format!(r#"<a href="{url}">{display}</a>"#),
                            None => url.to_string(),
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(" / "),
                NotificationChunk::Code { content, .. } => format!(r#"<pre>{content}</pre>"#),
            })
            .fold(String::new(), |acc, chunk| acc + "\n\n" + &chunk)
    }

    async fn send<T>(&self, req: T) -> Result<<T::Response as ResponseType>::Type>
    where
        T: Request + Debug,
        T::Response: ResponseType,
    {
        debug!(?req, "Sending request");
        let req = req.serialize()?;
        debug!(?req, "Serialized request");
        let method = match req.method {
            telegram_bot_raw_ars::Method::Get => reqwest::Method::GET,
            telegram_bot_raw_ars::Method::Post => reqwest::Method::POST,
        };

        self.client
            .request(
                method,
                req.url
                    .url(&self.config.bot_token)
                    .parse::<Url>()
                    .expect("Invalid URL"),
            )
            .pipe(|builder| match req.body {
                Body::Empty => builder,
                Body::Json(json) => builder
                    .body(json)
                    .header(header::CONTENT_TYPE, "application/json"),
                Body::Multipart(_) => {
                    unimplemented!("multipart is not implemented yet");
                }
                _ => unreachable!("Future body types are not implemented yet"),
            })
            .send()
            .await?
            .bytes()
            .await?
            .pipe(|bytes| {
                <T::Response as ResponseType>::deserialize(HttpResponse {
                    body: Some(bytes.to_vec()),
                })
            })
            .map_err(Into::into)
    }
}

#[async_trait::async_trait]
impl Actor for Telegram {
    type Arguments = ();
    type Msg = Notification;
    type State = ();

    async fn pre_start(
        &self,
        _: ActorRef<Self>,
        _: Self::Arguments,
    ) -> Result<Self::State, ActorProcessingErr> {
        Ok(())
    }

    async fn post_start(
        &self,
        _: ActorRef<Self>,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        info!("Telegram actor started");
        Ok(())
    }

    async fn handle(
        &self,
        _: ActorRef<Self>,
        message: Self::Msg,
        _: &mut Self::State,
    ) -> Result<(), ActorProcessingErr> {
        let msg = self.format(message);
        let msgs = self
            .config
            .chats
            .iter()
            .into_stream()
            .map(|chat| {
                SendMessage::new(ChatId::new(*chat), msg.clone()).tap_mut(|msg| {
                    msg.parse_mode(ParseMode::Html);
                })
            })
            .then(|msg| async move { self.send(msg).await })
            .try_collect::<Vec<_>>()
            .await
            .tap_err(|error| warn!(?error))?;

        debug!(?msgs, "Response");
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use std::{env, time::Duration};

    use color_eyre::Result;
    use ractor::Actor;
    use tap::Pipe;
    use tokio::time::timeout;
    use tracing::Level;

    use crate::{Link, Notification, NotificationChunk, TelegramConfig};

    #[tokio::test]
    async fn test_telegram() -> Result<()> {
        dotenv::dotenv().ok();
        tracing_subscriber::fmt()
            .with_max_level(Level::DEBUG)
            .try_init()
            .ok();

        let token = env::var("TELEGRAM_BOT_TOKEN").expect("TELEGRAM_BOT_TOKEN not set");
        let chat = env::var("TELEGRAM_CHAT_ID")
            .expect("TELEGRAM_CHAT_ID not set")
            .parse()?;

        let config = TelegramConfig {
            bot_token: token,
            chats: vec![chat],
        };

        let telegram = super::Telegram::new(config);

        let (actor, handle) = Actor::spawn(None, telegram, ()).await?;

        Notification::new()
            .with(NotificationChunk::Paragraph {
                title: "Lorem Ipsum".into(),
                content: "Ullamco id culpa ipsum dolor magna aliqua anim commodo. In cillum \
                          excepteur eu est. Anim mollit aliqua enim excepteur fugiat cupidatat \
                          nostrud adipisicing. Nulla irure adipisicing dolore eu eiusmod laborum \
                          nulla magna in excepteur irure aute."
                    .into(),
                title_url: Some("https://en.wikipedia.org/wiki/Lorem_ipsum".parse().unwrap()),
            })
            .with(NotificationChunk::Code {
                language: None,
                content: "let abc = 123; drop(abc)".to_owned(),
            })
            .with(NotificationChunk::Plain {
                content: "Occaecat qui reprehenderit deserunt nostrud reprehenderit nisi occaecat \
                          proident reprehenderit mollit. Esse non duis incididunt enim. Amet enim \
                          ipsum quis est commodo adipisicing cillum dolore. Commodo ea dolore \
                          consectetur culpa elit nulla ipsum. Consequat aliqua proident pariatur \
                          magna minim dolore reprehenderit quis."
                    .to_owned(),
            })
            .with(NotificationChunk::Links(vec![
                Link {
                    url: "https://en.wikipedia.org/wiki/Lorem_ipsum".parse().unwrap(),
                    display: Some("Lorem Ipsum".into()),
                },
                Link {
                    url: "https://en.wikipedia.org/wiki/Lorem_ipsum".parse().unwrap(),
                    display: None,
                },
            ]))
            .pipe(|n| actor.send_message(n))?;

        let _ = timeout(Duration::SECOND * 2, handle).await;

        Ok(())
    }
}

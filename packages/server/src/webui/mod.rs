use rust_embed::RustEmbed;
use salvo::{Router, serve_static::static_embed};

#[derive(RustEmbed)]
#[folder = "../../frontend/build/client"]
struct Assets;

pub fn router() -> Router {
    Router::with_path("<**path>").get(static_embed::<Assets>().fallback("index.html"))
}

#[cfg(test)]
mod test {
    use salvo::prelude::*;

    use crate::webui::router;

    #[tokio::test]
    async fn test_router() {
        let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
        Server::new(acceptor).serve(router()).await;
    }
}

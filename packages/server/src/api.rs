use salvo::prelude::*;

pub async fn run() {
    let sub_api = crud_router!("subscription", crate::subscription::Message);

    let router = Router::new().push(sub_api);
    let doc = OpenApi::new("forrit api", "0.1.0").merge_router(&router);
    let router = router
        .push(doc.into_router("/api-doc/openapi.json"))
        .push(SwaggerUi::new("/api-doc/openapi.json").into_router("swagger-ui"));

    let acceptor = TcpListener::new("127.0.0.1:8080").bind().await;
    Server::new(acceptor).serve(router).await;
}

macro_rules! crud_router {
    ($name:expr, $msg:ty) => {{
        use mongodb::bson::oid::ObjectId;
        use salvo::{
            oapi::extract::{JsonBody, PathParam},
            prelude::*,
        };
        use tap::Pipe;

        use crate::db::{CrudCall, FromCrud, WithId};

        type T = <$msg as FromCrud>::Item;

        #[derive(Debug, Clone, PartialEq, Eq, serde::Deserialize, serde::Serialize)]
        struct IdPath {
            id: ObjectId,
        }

        #[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Deserialize, serde::Serialize)]
        struct Res {
            ok: bool,
        }

        #[handler]
        async fn list() -> Json<Vec<WithId<T>>> {
            CrudCall::<$msg>::new($name).list().await.pipe(Json)
        }

        #[handler]
        async fn post(obj: JsonBody<T>) -> Text<String> {
            CrudCall::<$msg>::new($name)
                .create(obj.0)
                .await
                .to_hex()
                .pipe(Text::Plain)
        }

        #[handler]
        async fn get(path: PathParam<IdPath>) -> Json<Option<WithId<T>>> {
            CrudCall::<$msg>::new($name).get(path.0.id).await.pipe(Json)
        }

        #[handler]
        async fn delete(path: PathParam<IdPath>) -> Json<Option<WithId<T>>> {
            CrudCall::<$msg>::new($name).delete(path.0.id).await.pipe(Json)
        }

        #[handler]
        async fn put(path: PathParam<IdPath>, obj: JsonBody<T>) -> Json<Res> {
            CrudCall::<$msg>::new($name)
                .update(path.0.id, obj.0)
                .await
                .pipe(|ok| Json(Res { ok }))
        }

        Router::with_path($name)
            .get(list)
            .post(post)
            .push(Router::with_path("<id>").get(get).put(put).delete(delete))
    }};
}

pub(crate) use crud_router;

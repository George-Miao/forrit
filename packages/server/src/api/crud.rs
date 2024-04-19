use salvo::prelude::*;

macro_rules! build_crud {
    ($handler:ty, $tag:literal $(,)?) => {{
        use std::{fmt::Debug, marker::PhantomData};

        use forrit_core::model::{ListResult, UpdateResult, WithId};
        use mongodb::bson::doc;
        use mongodb_cursor_pagination::DirectedCursor;
        use salvo::{
            oapi::{endpoint, extract::JsonBody},
            prelude::*,
        };
        use tap::Pipe;

        use crate::{
            api::{ApiResult, CrudResultExt, CursorParam, OidParam},
            db::CrudHandler,
        };

        type R = <$handler as CrudHandler>::Resource;

        fn obtain(depot: &mut Depot) -> &$handler {
            depot
                .obtain::<$handler>()
                .expect(concat!("missing ", stringify!($handler)))
        }

        #[endpoint(operation_id = concat!("list_", $tag),tags($tag))]
        #[doc = concat!("List ", $tag)]
        async fn list(depot: &mut Depot, param: CursorParam) -> ApiResult<Json<ListResult<WithId<R>>>> {
            let param = if let Some(forward) = param.forward {
                Some(DirectedCursor::Forward(forward))
            } else if let Some(backwards) = param.backwards {
                Some(DirectedCursor::Backwards(backwards))
            } else {
                None
            };

            <$handler as CrudHandler>::list(obtain(depot), param)
                .await
                .map(Json)
                .map_err(Into::into)
        }

        #[endpoint(operation_id = concat!("create_", $tag), tags($tag))]
        #[doc = concat!("Create a new ", $tag)]
        async fn post(depot: &mut Depot, obj: JsonBody<R>) -> ApiResult<String> {
            <$handler as CrudHandler>::create(obtain(depot), obj.0)
                .await?
                .to_hex()
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("get_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Create ", $tag, " by id")]
        async fn get(depot: &mut Depot, id: OidParam) -> ApiResult<Json<WithId<R>>> {
            <$handler as CrudHandler>::get(obtain(depot), id.id)
                .await
                .unwrap_not_found($tag)
                .map(Json)
                .map_err(Into::into)
        }

        #[endpoint(operation_id = concat!("update_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Update ", $tag, " by id")]
        async fn put(depot: &mut Depot, id: OidParam, obj: JsonBody<R>) -> ApiResult<Json<UpdateResult>> {
            <$handler as CrudHandler>::update(obtain(depot), id.id, obj.0)
                .await?
                .pipe(Json)
                .pipe(Ok)
        }

        #[endpoint(operation_id = concat!("delete_", $tag, "_by_id"), tags($tag))]
        #[doc = concat!("Delete ", $tag, " by id")]
        async fn delete(depot: &mut Depot, id: OidParam) -> ApiResult<Json<WithId<R>>> {
            <$handler as CrudHandler>::delete(obtain(depot), id.id)
                .await
                .unwrap_not_found($tag)
                .map(Json)
                .map_err(Into::into)
        }

        CrudRouterBuilder::new(PhantomData::<$handler>, $tag, list, post, get, put, delete)
    }};
}

pub(super) use build_crud;

pub struct CrudRouterBuilder<H, L, C, R, U, D> {
    router: Router,
    id_router: Router,
    list: L,
    create: C,
    read: R,
    update: U,
    delete: D,
    _curd_handler: std::marker::PhantomData<H>,
}

impl<H, L, C, R, U, D> CrudRouterBuilder<H, L, C, R, U, D> {
    pub(crate) fn new(
        _curd_handler: std::marker::PhantomData<H>,
        route: &str,
        list: L,
        create: C,
        read: R,
        update: U,
        delete: D,
    ) -> Self {
        Self {
            router: Router::with_path(route),
            id_router: Router::with_path("<id>"),
            list,
            create,
            read,
            update,
            delete,
            _curd_handler,
        }
    }

    pub fn list(self) -> CrudRouterBuilder<H, (), C, R, U, D>
    where
        L: Handler,
    {
        let router = self.router.get(self.list);
        CrudRouterBuilder {
            router,
            list: (),
            ..self
        }
    }

    pub fn create(self) -> CrudRouterBuilder<H, L, (), R, U, D>
    where
        C: Handler,
    {
        let router = self.router.post(self.create);
        CrudRouterBuilder {
            router,
            create: (),
            ..self
        }
    }

    pub fn read(self) -> CrudRouterBuilder<H, L, C, (), U, D>
    where
        R: Handler,
    {
        let id_router = self.id_router.get(self.read);
        CrudRouterBuilder {
            id_router,
            read: (),
            ..self
        }
    }

    pub fn update(self) -> CrudRouterBuilder<H, L, C, R, (), D>
    where
        U: Handler,
    {
        let id_router = self.id_router.put(self.update);
        CrudRouterBuilder {
            id_router,
            update: (),
            ..self
        }
    }

    pub fn delete(self) -> CrudRouterBuilder<H, L, C, R, U, ()>
    where
        D: Handler,
    {
        let id_router = self.id_router.delete(self.delete);
        CrudRouterBuilder {
            id_router,
            delete: (),
            ..self
        }
    }
}

impl<H, L, C, R, U, D> CrudRouterBuilder<H, L, C, R, U, D>
where
    H: Send + Sync + Clone + 'static,
{
    pub fn without_create(self, handler: H) -> Router
    where
        L: Handler,
        R: Handler,
        U: Handler,
        D: Handler,
    {
        self.list().read().update().delete().build(handler)
    }

    pub fn all(self, handler: H) -> Router
    where
        L: Handler,
        C: Handler,
        R: Handler,
        U: Handler,
        D: Handler,
    {
        self.list().create().read().update().delete().build(handler)
    }

    pub fn build(self, handler: H) -> Router
    where
        H: Send + Sync,
    {
        struct HandlerHoop<H>(H);

        #[async_trait]
        impl<H> Handler for HandlerHoop<H>
        where
            H: Send + Sync + Clone + 'static,
        {
            async fn handle(&self, _: &mut Request, depot: &mut Depot, _: &mut Response, _: &mut FlowCtrl) {
                depot.inject(self.0.clone());
            }
        }

        self.router.push(self.id_router).hoop(HandlerHoop(handler))
    }
}

use salvo::{
    Writer,
    oapi::extract::JsonBody,
    prelude::{Depot, Json, Router, endpoint},
};

use super::{ConfigError, ConfigStore, ConfigUpdate, ConfigView};
use crate::{
    api::{ApiError, ApiResult},
    reload_config,
};

fn obtain(depot: &Depot) -> &ConfigStore {
    depot.obtain::<ConfigStore>().expect("missing ConfigStore")
}

fn map_error(error: ConfigError) -> ApiError {
    match error {
        ConfigError::Database(error) => ApiError::DatabaseError(error),
        ConfigError::Invalid(reason) => ApiError::InvalidRequest { reason },
        ConfigError::Conflict => ApiError::Conflict {
            reason: "configuration changed; reload before retrying".to_owned(),
        },
    }
}

#[endpoint(operation_id = "get_config", tags("config"))]
async fn get_config(depot: &Depot) -> Json<ConfigView> {
    Json(obtain(depot).view())
}

#[endpoint(operation_id = "update_config", tags("config"))]
async fn update_config(depot: &Depot, update: JsonBody<ConfigUpdate>) -> ApiResult<Json<ConfigView>> {
    let store = obtain(depot);
    let view = match store.update(update.into_inner()).await {
        Ok(view) => view,
        Err(ConfigError::Conflict) => {
            reload_config();
            return Err(map_error(ConfigError::Conflict));
        }
        Err(error) => return Err(map_error(error)),
    };
    if reload_config() {
        Ok(Json(view))
    } else {
        store.warning("Runtime configuration update could not reach the supervisor");
        Ok(Json(store.view()))
    }
}

pub fn config_api() -> Router {
    Router::with_path("config").get(get_config).patch(update_config)
}

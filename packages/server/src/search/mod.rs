mod api;
mod model;
mod store;
mod text;

pub use api::search_api;
pub use model::{
    BsonAlias, BsonEntry, BsonMeta, SearchEntryHit, SearchEntryPage, SearchMatch, SearchMetaGroup, SearchMetaPage,
    SearchResult, SearchSection,
};
pub use store::{AliasStorage, Search};
pub use text::MaterializeError;

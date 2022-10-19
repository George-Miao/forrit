use color_eyre::Result;
use ejdb::bson::Document;

pub trait AsDocument {
    fn as_document(&self) -> Result<Document>;
}

pub mod model;
mod model_impl;
mod util;

use model::*;
pub use util::IntoStream;

#[test]
pub fn export_ts() {
    // let a = <(Subscription, Job) as ts_rs::TS>::export_to_string().unwrap();
    // println!("{}", a);
}

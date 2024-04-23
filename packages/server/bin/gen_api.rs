use std::{
    env::{args, current_exe},
    fs,
};

use forrit_server::api::gen_oapi;

fn main() {
    let Some(dir) = args().nth(1) else {
        eprintln!("Usage: {} <output dir>", current_exe().unwrap().display());
        std::process::exit(1);
    };
    let dir = camino::Utf8PathBuf::from(dir);
    let json = gen_oapi().expect("failed to generate openapi");

    let output_path = if dir.is_dir() {
        std::fs::create_dir_all(&dir).expect("failed to create output dir");
        dir.join("openapi.json")
    } else {
        dir
    };

    fs::write(&output_path, json).expect("failed to write to file");
    println!("OpenAPI spec written to {}", output_path);
}

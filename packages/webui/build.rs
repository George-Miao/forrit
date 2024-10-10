use std::process;

fn main() {
    println!("cargo:rerun-if-changed=../../frontend/app");
    println!("cargo:rerun-if-changed=../../frontend/public");
    println!("cargo:rerun-if-changed=../../frontend/package.json");
    println!("cargo:rerun-if-changed=../../frontend/tsconfig.json");
    println!("cargo:rerun-if-changed=../../frontend/vite.config.ts");

    build();
}

fn build() {
    eprintln!("Frontend installing");
    process::Command::new("npm")
        .args(["install"])
        .current_dir("../../frontend")
        .status()
        .expect("Failed to install");

    eprintln!("Frontend building");
    process::Command::new("npm")
        .args(["run", "build"])
        .current_dir("../../frontend")
        .status()
        .expect("Failed to build");
}

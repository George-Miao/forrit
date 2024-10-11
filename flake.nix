{
  description = "Forrit flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    rust-overlay,
    nixpkgs,
    flake-utils,
    crane,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [(import rust-overlay)];
        };
        rust =
          (pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml)
          .override {
            extensions = [
              "rust-src"
              "rust-analyzer"
            ];
          };

        buildInputs = with pkgs; [openssl];
        nativeBuildInputs = with pkgs; [
          pkg-config
          llvmPackages_latest.bintools
          llvmPackages_latest.libstdcxxClang
        ];

        craneLib = (crane.mkLib pkgs).overrideToolchain (p: rust);

        darwinFramework =
          pkgs.lib.lists.optional (pkgs.system == "aarch64-darwin" || pkgs.system == "x86_64-darwin")
          pkgs.darwin.apple_sdk.frameworks.SystemConfiguration;

        forrit-server = craneLib.buildPackage {
          inherit buildInputs;
          src = ./.;
          pname = "forrit-server";
          cargoExtraArgs = "--locked --package forrit-server --bin forrit-server";
          strictDeps = true;
          doCheck = false;
          nativeBuildInputs = nativeBuildInputs ++ (with pkgs; [nodejs nodePackages.npm]);
        };
        forrit-server-without-webui = craneLib.buildPackage {
          inherit buildInputs nativeBuildInputs;
          src = craneLib.cleanCargoSource ./.;
          pname = "forrit-server";
          cargoExtraArgs = "--locked --package forrit-server --bin forrit-server --no-default-features";
          strictDeps = true;
          doCheck = false;
        };
      in {
        inherit forrit-server forrit-server-without-webui;

        devShells = with pkgs; {
          default = mkShell.override {stdenv = stdenvNoLibs;} {
            inherit buildInputs nativeBuildInputs;
            packages =
              [
                rust
                just
                biome
                nodejs
                nodePackages.typescript
                nodePackages.pnpm
                mongosh
                openssl
              ]
              ++ darwinFramework;
          };
        };
        packages = {
          inherit forrit-server forrit-server-without-webui;
        };
        apps = rec {
          default = server;
          server = flake-utils.lib.mkApp {
            drv = forrit-server;
          };
        };
      }
    );
}

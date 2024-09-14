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
        rust = (pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml).override {extensions = ["rust-src"];};
        shared = with pkgs; {
          buildInputs = [
            openssl
          ];

          nativeBuildInputs = [
            pkg-config
            llvmPackages_latest.bintools
            llvmPackages_latest.libstdcxxClang
          ];
        };
        craneLib = (crane.mkLib pkgs).overrideToolchain (p: rust);
        darwinFramework =
          pkgs.lib.lists.optional (pkgs.system == "aarch64-darwin" || pkgs.system == "x86_64-darwin")
          pkgs.darwin.apple_sdk.frameworks.SystemConfiguration;

        forrit-server = craneLib.buildPackage ({
            src = craneLib.cleanCargoSource ./.;
            pname = "forrit-server";
            cargoExtraArgs = "--locked --release --package forrit-server --bin forrit-server";
            strictDeps = true;
            doCheck = false;
          }
          // shared);
      in {
        inherit forrit-server;

        devShells = with pkgs; {
          default = mkShell.override {stdenv = stdenvNoLibs;} ({
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
            }
            // shared);
        };
        packages = {inherit forrit-server;};
        apps = rec {
          default = server;
          server = flake-utils.lib.mkApp {
            drv = forrit-server;
          };
        };
      }
    );
}

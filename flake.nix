{
  description = "Forrit flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      rust-overlay,
      nixpkgs,
      flake-utils,
      devshell,
      crane,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [
            (import rust-overlay)
            devshell.overlays.default
          ];
        };
        rust = (pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml).override {
          extensions = [
            "rust-src"
            "rust-analyzer"
          ];
        };

        buildInputs = with pkgs; [ openssl ];
        nativeBuildInputs = with pkgs; [
          pkg-config
          cmake
          llvmPackages_latest.bintools
          llvmPackages_latest.libstdcxxClang
        ];

        craneLib = (crane.mkLib pkgs).overrideToolchain (p: rust);

        forrit-server = craneLib.buildPackage {
          inherit buildInputs;
          src = ./.;
          pname = "forrit-server";
          cargoExtraArgs = "--locked --package forrit-server --bin forrit-server";
          strictDeps = true;
          doCheck = false;
          nativeBuildInputs =
            nativeBuildInputs
            ++ (with pkgs; [
              nodejs
            ]);
        };
        forrit-server-without-webui = craneLib.buildPackage {
          inherit buildInputs nativeBuildInputs;
          src = ./.;
          pname = "forrit-server";
          cargoExtraArgs = "--locked --package forrit-server --bin forrit-server --no-default-features";
          strictDeps = true;
          doCheck = false;
        };
        forrit-server-docker = pkgs.dockerTools.buildImage {
          name = "forrit-server-docker";
          contents = [ pkgs.cacert ];
          config = {
            Env = [
              "SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
              "SSL_CERT_DIR=/etc/ssl/certs"
              "NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
            ];
            Cmd = [ "${forrit-server}/bin/forrit-server" ];
          };
        };
        forrit-server-without-webui-docker = pkgs.dockerTools.buildImage {
          name = "forrit-server-without-webui-docker";
          contents = [ pkgs.cacert ];
          config = {
            Env = [
              "SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
              "SSL_CERT_DIR=/etc/ssl/certs"
              "NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
            ];
            Cmd = [ "${forrit-server-without-webui}/bin/forrit-server" ];
          };
        };
      in
      rec {
        inherit forrit-server forrit-server-without-webui;

        devShells.default = pkgs.devshell.mkShell {
          devshell.name = "forrit";
          devshell.packages =
            buildInputs
            ++ (with pkgs; [
              pkg-config
              llvmPackages_latest.libstdcxxClang
              rust
              biome
              nodejs
              typescript
              pnpm
              mongosh
            ]);
          env = [
            {
              name = "PKG_CONFIG_PATH";
              prefix = "${pkgs.lib.getDev pkgs.openssl}/lib/pkgconfig";
            }
            {
              name = "PLAYWRIGHT_BROWSERS_PATH";
              value = pkgs.playwright-driver.browsers;
            }
            {
              name = "PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS";
              value = "true";
            }
          ];
          commands = [
            {
              name = "server";
              help = "Start the Rust server";
              command = ''
                cd "$PRJ_ROOT"
                exec cargo run --bin forrit-server -- "''${1:-data/config.toml}"
              '';
            }
            {
              name = "frontend";
              help = "Start MongoDB, the Rust server, and Vite";
              command = ''
                set -euo pipefail
                cd "$PRJ_ROOT"
                docker compose up --detach --wait mongodb

                env \
                  'FORRIT.DATABASE.URL=mongodb://127.0.0.1:27017' \
                  'FORRIT.HTTP.BIND=127.0.0.1:8080' \
                  'FORRIT.HTTP.WEBUI=false' \
                  cargo run --bin forrit-server -- "''${1:-data/config.toml}" &
                server_pid=$!
                trap 'kill "$server_pid" 2>/dev/null || true; wait "$server_pid" 2>/dev/null || true' EXIT
                trap 'exit 130' INT
                trap 'exit 143' TERM

                cd frontend
                VITE_API_PROXY_TARGET=http://127.0.0.1:8080 pnpm dev --host
              '';
            }
            {
              name = "frontend-down";
              help = "Stop MongoDB without deleting its data";
              command = ''
                cd "$PRJ_ROOT"
                exec docker compose stop mongodb
              '';
            }
            {
              name = "gen_api";
              help = "Generate the OpenAPI schema";
              command = ''
                cd "$PRJ_ROOT"
                exec cargo run --bin gen_api -- data/openapi.json
              '';
            }
            {
              name = "gen_ts";
              help = "Generate and build the TypeScript API client";
              command = ''
                set -e
                cd "$PRJ_ROOT/clients/typescript"
                pnpm install --frozen-lockfile
                pnpm exec openapi-typescript ../../data/openapi.json -o src/schema.ts
                exec pnpm build
              '';
            }
            {
              name = "reload_ts";
              help = "Regenerate and reinstall the frontend API client";
              command = ''
                set -e
                gen_api
                gen_ts
                cd "$PRJ_ROOT/frontend"
                exec pnpm install --frozen-lockfile --force
              '';
            }
            {
              name = "build_server";
              help = "Build the release server binary";
              command = ''
                cd "$PRJ_ROOT"
                exec cargo build --release --bin forrit-server
              '';
            }
            {
              name = "build_frontend";
              help = "Build the production frontend assets";
              command = ''
                set -e
                cd "$PRJ_ROOT/frontend"
                pnpm install --frozen-lockfile
                exec pnpm build
              '';
            }
          ];
        };
        packages = {
          inherit
            forrit-server
            forrit-server-without-webui
            forrit-server-docker
            forrit-server-without-webui-docker
            ;
          shell = devShells.default;
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

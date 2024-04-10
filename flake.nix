{
  description = "Forrit flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    rust-overlay,
    nixpkgs,
    ...
  }: let
    forAllSystems = function:
      nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "x86_64-darwin"
        "aarch64-linux"
        "aarch64-darwin"
      ] (system:
        function (import nixpkgs {
          inherit system;
          overlays = [(import rust-overlay)];
        }));
  in {
    devShells = forAllSystems (
      pkgs:
        with pkgs; let
          llvm = pkgs.llvmPackages_latest;
        in {
          default = mkShell.override {stdenv = stdenvNoLibs;} {
            packages =
              [
                ((rust-bin.fromRustupToolchainFile ./rust-toolchain.toml).override
                  {
                    extensions = ["rust-src"];
                  })
                llvm.bintools
                llvm.libstdcxxClang
                just
                openssl
                nodePackages.typescript
                mongosh
                pkg-config
              ]
              ++ (
                if pkgs.system == "aarch64-darwin" || pkgs.system == "x86_64-darwin"
                then [
                  darwin.apple_sdk.frameworks.SystemConfiguration
                ]
                else []
              );
          };
        }
    );
  };
}

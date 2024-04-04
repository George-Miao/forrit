{
  description = "Forrit flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = {
    self,
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
        with pkgs; {
          default = mkShell {
            buildInputs =
              [
                just
                nodePackages.typescript
                mongosh
                openssl
                pkg-config
                ((rust-bin.fromRustupToolchainFile ./rust-toolchain.toml).override
                  {
                    extensions = ["rust-src"];
                  })
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

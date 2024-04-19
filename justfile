gen_ts:
  TS_RS_EXPORT_DIR=../../clients/typescript/src/bindings cargo test -p forrit-core --all-features -- export_bindings

reload_ts:
  (cd clients/typescript && pnpm build) && (cd frontend && pnpm i)

server:
  cargo run -p forrit-server -- data/config.toml

frontend:
  cd frontend && pnpm dev --host
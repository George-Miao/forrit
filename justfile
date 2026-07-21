alias f := frontend
alias s := server

gen_api:
  cargo run --bin gen_api -- data/openapi.json

gen_ts:
  cd clients/typescript && npx openapi-typescript ../../data/openapi.json -o src/schema.ts && npx tsc

reload_ts:
  rm -rf frontend/node_modules/forrit-client clients/typescript/{src/schema.ts, dist}
  just gen_api
  just gen_ts
  (cd clients/typescript && pnpm build)
  (cd frontend && pnpm i forrit-client)

server:
  cargo run --bin forrit-server -- data/config.toml

frontend:
  #!/usr/bin/env bash
  set -euo pipefail

  docker compose up --detach --wait mongodb

  env \
    'FORRIT.DATABASE.URL=mongodb://127.0.0.1:27017' \
    'FORRIT.HTTP.BIND=127.0.0.1:8080' \
    'FORRIT.HTTP.WEBUI=false' \
    cargo run --bin forrit-server -- data/config.toml &
  server_pid=$!

  cleanup() {
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  }
  trap cleanup EXIT INT TERM

  cd frontend
  VITE_API_PROXY_TARGET=http://127.0.0.1:8080 pnpm dev --host

frontend-down:
  docker compose stop mongodb

build_server:
  cargo build --release --bin forrit-server

build_frontend:
  cd frontend && pnpm i && pnpm build

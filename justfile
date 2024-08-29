gen_ts:
  cd clients/typescript && npx openapi-typescript ../../data/openapi.json -o src/schema.ts && npx tsc

gen_api:
  cargo run --bin gen_api -- data/openapi.json

reload_ts:
  rm -rf frontend/node_modules/forrit-client clients/typescript/{src/schema.ts, dist}
  just gen_api
  just gen_ts
  (cd clients/typescript && pnpm build)
  (cd frontend && pnpm i forrit-client)

server:
  cargo run --bin server -- data/config.toml

frontend:
  cd frontend && pnpm dev --host
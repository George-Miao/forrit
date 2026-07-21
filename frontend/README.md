# Forrit Frontend

Remix + Vite based user interface for Forrit. It uses the generated `forrit-client` SDK to talk to the backend API.

## Deployment

Normally you don't need to deploy this separatedly since it's embedded into the server binary when built with the `webui` feature. If you want to run it standalone, you can build it with `pnpm build` and serve the generated assets in `build/client` with any static file server. Just make sure to set `VITE_API_BASE_URL` to point to your backend instance.

## Development

### Prerequisites

- Node.js 18+
- pnpm
- Docker with Docker Compose
- A local `data/config.toml` for the Forrit server

### Getting Started

Install the frontend dependencies once:

```sh
pnpm install
```

Then, from the repository root, start the complete frontend development stack:

```sh
just frontend
```

This starts a persistent local MongoDB container, the real Forrit Rust server,
and the Vite dev server with hot reloading. Vite proxies `/api` to the Rust
server on `127.0.0.1:8080`. The database URL, HTTP bind, and embedded web UI
settings in `data/config.toml` are overridden for this workflow; all other
server settings still come from that file.

The MongoDB container stays running after the frontend exits so subsequent
starts are fast, and its data is retained in the `forrit-mongodb` Docker volume.
Stop the container without deleting its data with:

```sh
just frontend-down
```

To run only Vite, use `pnpm dev -- --host` from this directory. Set
`VITE_API_PROXY_TARGET` if the backend is not listening on
`http://127.0.0.1:8080`.

### Linting

Run ESLint with:

```sh
pnpm lint
```

### Building

Create a production build:

```sh
pnpm build
```

The generated assets live in `build/client`. The server binary embeds `build/client` when compiled with the `webui` feature.

### Previewing the Build

After building, you can preview the production bundle locally:

```sh
pnpm start
```

This starts the Remix production server and serves the generated assets.

### Regenerating the API Client

If the backend OpenAPI schema changes, regenerate the TypeScript client before building:

```sh
just reload_ts
```

That command rebuilds `forrit-client`, reinstalls it into the frontend, and ensures the components use the latest API contracts.

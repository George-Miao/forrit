# Forrit Frontend

Remix + Vite based user interface for Forrit. It uses the generated `forrit-client` SDK to talk to the backend API.

## Deployment

Normally you don't need to deploy this separatedly since it's embedded into the server binary when built with the `webui` feature. If you want to run it standalone, you can build it with `pnpm build` and serve the generated assets in `build/client` with any static file server. Just make sure to set `VITE_API_BASE_URL` to point to your backend instance.

## Development

### Prerequisites

- Node.js 18+
- pnpm
- A running Forrit backend (see the repository root README)

### Getting Started

Install dependencies and start the dev server with hot reloading:

```sh
pnpm install
pnpm dev -- --host
```

By default the dev server proxies API calls to `/api`. Start the backend locally with `just server` or set `VITE_API_BASE_URL` to target a remote instance before running `pnpm dev`.

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

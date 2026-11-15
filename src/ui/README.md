# UI

React + Vite + TypeScript frontend. It includes a MapLibre map with [OpenFreeMap](https://openfreemap.org) vector tiles and Plotly charts (the `plotly.js-basic-dist-min` bundle, loaded lazily).

The interface is in English by default, following the Space Apps minimum requirement.

## Requirements

- Node.js 20+
- pnpm

## Local development

From `src/ui/`:

```sh
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

The UI runs at `http://localhost:5173` and expects the API at `VITE_API_BASE_URL`.

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Development server. |
| `pnpm build` | Typecheck and production build. |
| `pnpm lint` | ESLint. |
| `pnpm test` | Vitest. |
| `pnpm generate:api-types` | Generate TypeScript types from the `src/contracts/` OpenAPI schema. |

## API types

`src/types/contracts.gen.ts` is generated from `src/contracts/openapi.json` with `pnpm generate:api-types`. Do not edit it by hand; CI fails if it is stale.

## Current scope

The scaffold (#8) provides the layout, map, sample chart, API client and tooling. The guided flow, verdict, demos and trend maps are implemented in #9, #10, #11 and #23.

## Trend maps

Static trend-map files are served from `public/trend-maps/`. The provisional manifest format is documented in [`public/trend-maps/README.md`](public/trend-maps/README.md). The sample file is clearly marked as sample data until the pipeline in #22 generates the real maps.

## Deployment (Vercel)

- *Root Directory*: `src/ui` (the repository is a monorepo).
- `vercel.json` defines the build and output; Vercel detects Vite.
- Set `VITE_API_BASE_URL` to the public Render API URL.
- While Render wakes up (~1 min on the free plan), `ApiStatus` shows "Waking up the server…".

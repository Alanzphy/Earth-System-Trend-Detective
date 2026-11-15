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

## App structure

`App.tsx` renders, in order: header (with the "not a forecast" note and `ApiStatus`), demos (`DemoGallery`, static files in `public/demos/`), the trend map (`TrendMap`), the guided flow (`GuidedFlow`) and the results (`LiveAnalysis` → `AnalysisResult` = lazy `AnalysisChart` + `VerdictCard`).

- **State in the URL**: `?variable=&bbox=minLon,minLat,maxLon,maxLat&start=YYYY-MM&end=YYYY-MM&compare=…` (`src/lib/flow.ts`). A link with variable and region runs the analysis on load.
- **API**: `GET /variables` and `POST /trend` (`src/lib/api.ts`); `ErrorResponse` is shown as-is. After 5 s without an answer the UI says the server is waking up (`src/lib/useWaking.ts`).
- **Glossary**: `src/lib/glossary.ts` mirrors the English column of `docs/glossary.md`; `GlossaryTerm` shows the definition as an accessible toggletip.
- **Types**: always import contract types from `src/types/contracts.ts` (aliases of the generated file).

## Demos

`public/demos/manifest.json` (`DemoManifest`) lists the demos; each file is a `Demo` with one or two panels (two panels are shown side by side). The pipeline (#22) writes the real files; `sample-rain-opposite-directions.json` is a synthetic sample (marked "Sample" in its title and labels) for development.

## Trend maps

Static trend-map files are served from `public/trend-maps/` and follow the `TrendMapManifest` v2 contract (see [`public/trend-maps/README.md`](public/trend-maps/README.md)). The sample entry has `"is_sample": true` and shows a "Sample data" badge until the pipeline in #22 generates the real maps. Map fill and legend share the same diverging palette (`src/lib/palette.ts`): `RdBu` for temperature-like variables, `BrBG` for water-like ones, always centered at 0.

With several maps in the manifest, buttons switch between them. Each GeoJSON (thousands of cells, ~1.5 MB) is fetched only when the map is near the viewport and only for the selected map, and goes straight to a MapLibre source (no per-cell React rendering). "Analyze this region" fills the guided flow with the cell's variable, bbox and period and runs the analysis.

## Deployment (Vercel)

- *Root Directory*: `src/ui` (the repository is a monorepo).
- `vercel.json` defines the build and output; Vercel detects Vite.
- Set `VITE_API_BASE_URL` to the public Render API URL.
- While Render wakes up (~1 min on the free plan), `ApiStatus` shows "Waking up the server…".

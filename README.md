# Earth System Trend Detective

An educational web app for exploring NASA Earth science variables, visualizing how they change over time, and testing whether their trends are statistically significant.

Built for the **2026 NASA Space Apps Challenge**.

## Live project

| Resource | Link |
|---|---|
| Source code | https://github.com/Alanzphy/Earth-System-Trend-Detective |
| Web app | https://earth-system-trend-detective-xi.vercel.app |
| API health | https://estd-api-8l11.onrender.com/health (the free Render tier may take ~1 minute to wake up; demos and maps do not need it) |
| Space Apps project page | Add the public project page URL before submission |

## What it does

Earth system variables can trend upward in one region and downward in another, even when the same process drives both. The app helps students become data detectives:

- Choose an Earth science variable: air temperature, precipitation, relative and specific humidity, wind speed, solar radiation, evapotranspiration or root-zone soil wetness.
- Pick a region and a time period.
- Inspect the raw series, the deseasonalized series and the trend line.
- Read a plain-language verdict with the direction, magnitude in units per decade, p-value and significance.
- Compare regions to see opposite trends of the same variable.
- Explore a precomputed pixel trend map to see where change is happening.

The UI is in English by default, following the Space Apps minimum requirements.

## How it works

1. **Guided questions** help the user choose a topic and a region.
2. **Variable catalog** provides simple definitions and units.
3. **Data layer** downloads monthly gridded data from NASA POWER (MERRA-2 based, 0.5° × 0.625°) for the region and averages it with cos(latitude) weights.
4. **Analysis layer** removes the seasonal cycle (monthly anomalies), estimates the slope per decade with Theil–Sen and tests significance with the Mann–Kendall test using the Hamed–Rao correction for autocorrelation (α = 0.05).
5. **Verdict** reports direction, change per decade with 95% confidence interval, total change, p-value, method, period, region and units in plain language. It describes past change; it is not a forecast.
6. **Precomputed demos and trend maps** (2.5° cells worldwide, Benjamini–Hochberg FDR correction across cells) are served as static files, so they work even when the free backend is asleep.

## NASA data and credits

- [NASA POWER](https://power.larc.nasa.gov/) — all variables in the app. *These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.* Meteorology derived from [MERRA-2](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/); solar radiation from CERES/GEWEX.
- [NASA Earthdata](https://www.earthdata.nasa.gov/) and [GES DISC](https://disc.gsfc.nasa.gov/) — evaluated for future variables (sea surface temperature, aerosols, vegetation via [Giovanni](https://giovanni.gsfc.nasa.gov/)).

Dataset details, validation and access notes are in [`docs/data-sources.md`](docs/data-sources.md).

This is not an official NASA product and is not endorsed by NASA. No NASA logos, flags or mission identifiers are used in the generated project content.

## Tech stack

- **Frontend**: React, Vite, TypeScript, MapLibre GL, Plotly, pnpm, ESLint, Vitest, Vercel.
- **Backend**: Python 3.12, FastAPI, Pydantic, pymannkendall, uv, ruff, pytest, Docker, Render.
- **Precomputed data**: Python pipeline for demos and pixel trend maps, served as static files.
- **Contracts**: Pydantic models → OpenAPI → TypeScript types.

## Repository layout

```text
docs/          living documentation and decisions
src/contracts/ shared Pydantic schemas → OpenAPI → TypeScript types
src/data/      NASA POWER client, tiling, area averages
src/analysis/  anomalies, Theil–Sen, Mann–Kendall (Hamed–Rao), verdict
src/api/       FastAPI backend (/variables, /trend)
src/pipeline/  offline generation of demos and trend maps
src/ui/        React frontend
```

## Local development

Python workspace (repository root):

```sh
cp .env.example .env
uv sync
uv run ruff check .
uv run pytest
```

API:

```sh
uv run uvicorn app.main:app --reload
```

Regenerate demos and trend maps (writes `src/ui/public/`; trend maps download ~2 GB from NASA POWER):

```sh
uv run python -m pipeline demos
uv run python -m pipeline trend-maps
```

UI:

```sh
cd src/ui
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

API documentation is available at `http://localhost:8000/docs` while the API is running.

## Verification

```sh
uv run ruff check .
uv run pytest
cd src/ui && pnpm lint && pnpm test && pnpm build
```

## AI usage declaration

This project's code and documentation were developed with the assistance of AI coding agents: **omp** (oh-my-pi) running Anthropic Claude models, and **opencode**. AI was used for code generation, refactoring, tests, data validation scripts and documentation; every change was reviewed and merged by the team through pull requests with automated tests. No AI-generated images, video or audio are included. NASA data is used according to the dataset terms listed above. This declaration is also on the Space Apps project page.

## Space Apps submission

The submission checklist, English project-page copy, demo storyboard and AI declaration are in [`docs/submission.md`](docs/submission.md).

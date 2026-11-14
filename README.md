# Earth System Trend Detective

An educational web app for exploring NASA Earth science variables, visualizing how they change over time, and testing whether their trends are statistically significant.

Built for the **2026 NASA Space Apps Challenge**.

## Live project

| Resource | Link |
|---|---|
| Source code | https://github.com/Alanzphy/Earth-System-Trend-Detective |
| Web app | Add the Vercel production URL after the first deployment |
| API health | https://estd-api.onrender.com/health (the free Render tier may take ~1 minute to wake up) |
| Space Apps project page | Add the public project page URL before submission |

## What it does

Earth system variables can trend upward in one region and downward in another, even when the same process drives both. The app helps students become data detectives:

- Choose an Earth science variable such as air temperature, precipitation, humidity, wind, radiation, soil moisture, sea surface temperature, aerosols or vegetation.
- Pick a region and a time period.
- Inspect the raw series, the deseasonalized series and the trend line.
- Read a plain-language verdict with the direction, magnitude in units per decade, p-value and significance.
- Compare regions to see opposite trends of the same variable.
- Explore a precomputed pixel trend map to see where change is happening.

The UI is in English by default, following the Space Apps minimum requirements.

## How it works

1. **Guided questions** help the user choose a topic and a region.
2. **Variable catalog** provides simple definitions and units.
3. **Data layer** requests area-averaged series from NASA POWER and Giovanni Time Series.
4. **Analysis layer** removes the seasonal cycle, estimates the trend with Theil–Sen and tests significance with Mann–Kendall.
5. **Verdict** reports method, period, region, units and statistical significance.
6. **Precomputed maps and demos** are served as static files so the landing page and demos keep working even when the free backend is asleep.

## NASA data and credits

This project uses or plans to use the following NASA and partner resources:

- [NASA POWER](https://power.larc.nasa.gov/) — meteorology and solar energy parameters.
- [NASA GES DISC Giovanni](https://giovanni.gsfc.nasa.gov/) — time series for precipitation, temperature, aerosols and vegetation.
- [NASA Earthdata](https://www.earthdata.nasa.gov/) — authentication and data discovery.
- [NASA GLDAS](https://ldas.gsfc.nasa.gov/gldas/) — land surface and soil moisture.
- [NASA MERRA-2](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/) — reanalysis variables.
- [NASA MODIS](https://modis.gsfc.nasa.gov/) — land, atmosphere and vegetation observations.
- [NASA GPM](https://gpm.nasa.gov/) — precipitation.
- [NASA Worldview](https://worldview.earthdata.nasa.gov/) — visual exploration of Earth data.
- [CUAHSI](https://www.cuahsi.org/) — hydrology data and tools.

Dataset details, access notes and status are maintained in [`docs/data-sources.md`](docs/data-sources.md).

This is not an official NASA product and is not endorsed by NASA. No NASA logos, flags or mission identifiers are used in the generated project content.

## Tech stack

- **Frontend**: React, Vite, TypeScript, MapLibre GL, Plotly, pnpm, ESLint, Vitest, Vercel.
- **Backend**: Python 3.12, FastAPI, Pydantic, pymannkendall, uv, ruff, pytest, Docker, Render.
- **Precomputed data**: Python pipeline for demos and pixel trend maps, served as static files.
- **Contracts**: Pydantic models → OpenAPI → TypeScript types.

## Repository layout

```text
docs/          living documentation and decisions
src/contracts/ shared schemas
src/data/      data ingestion and caching
src/analysis/  trend and significance methods
src/api/       FastAPI backend
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
cd src/api
uv run uvicorn app.main:app --reload
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

This project's code and documentation were developed with the assistance of AI coding agents (opencode). AI was used for code generation, refactoring, tests and documentation. No AI-generated images or videos are included. NASA data is used according to the dataset terms listed above. This declaration is included on the Space Apps project page and in this README.

## Space Apps submission

The submission checklist, English project-page copy, demo storyboard and AI declaration are in [`docs/submission.md`](docs/submission.md).

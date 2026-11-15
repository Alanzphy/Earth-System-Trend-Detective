# Entrega Space Apps

> Estado de la entrega y textos listos para copiar en la página del proyecto. La página y el video/diapositivas se suben a `spaceappschallenge.org`.

## Checklist mínimo

| Requisito | Estado | Evidencia |
|---|---|---|
| Página del proyecto en inglés | Texto listo; falta publicarla | Sección "Project page copy" |
| Demo de ≤ 30 s o ≤ 7 diapositivas | Guion y storyboard listos; falta grabar/exportar | Sección "Demo" |
| Declaración de uso de IA en la página y en el README | Lista | `README.md` y sección "AI usage declaration" |
| Sin logos ni elementos de marca de NASA | Cumplido | El repo no incluye logos ni identificadores de misión |
| Links públicos sin contraseña | GitHub, web y API públicos; falta la página del proyecto | Sección "Links" |
| README en inglés con créditos de datasets NASA | Cumplido | `README.md` |
| Datos y recursos de NASA usados | Cumplido | NASA POWER; `docs/data-sources.md` |

## Project page copy

### Title

Earth System Trend Detective

### Elevator pitch

A student-friendly tool that turns NASA Earth science data into a detective story: pick a variable and a region, see how it changes over time, and find out whether the trend is statistically significant.

### Inspiration

Earth's environment is always changing. A variable can rise in one region and fall in another, even when the same process drives both. NASA satellites and models measure many variables, but students need help choosing which ones show change and understanding what the numbers mean.

### What it does

- Lets students explore eight NASA POWER variables: air temperature, precipitation, relative and specific humidity, wind speed, solar radiation, evapotranspiration and root-zone soil wetness (1981–2025, monthly).
- Shows a time series, a deseasonalized series and a trend line for a selected region and period.
- Reports the direction, magnitude in units per decade, p-value and significance in plain language.
- Compares regions to reveal opposite trends of the same variable.
- Includes a precomputed pixel trend map that shows where change is happening, with statistically significant areas highlighted and non-significant areas faded.
- Keeps demos and maps available as static files, so the landing page still works when the free backend is asleep.

### How we built it

- React, Vite, TypeScript, MapLibre GL and Plotly for the interface.
- FastAPI and Pydantic for the backend and contracts.
- cos(latitude)-weighted area averages, monthly anomalies, Theil–Sen slope per decade and Mann–Kendall test with the Hamed–Rao autocorrelation correction.
- NASA POWER monthly regional data (MERRA-2 based), requested in 10° tiles.
- An offline pipeline for demos and worldwide 2.5° trend maps with Benjamini–Hochberg FDR correction.
- GitHub Actions for linting, tests and contract/type drift checks.

### Challenges

- Regional trends can be noisy and seasonal, so the seasonal cycle must be removed before testing.
- A trend can be real but not statistically significant; the interface must explain that difference without misleading students.
- NASA services can be slow or require authentication, so the user experience needs caching, clear loading states and static demos.
- The same variable can show opposite trends in nearby regions, which is exactly the behavior the tool should make visible.

### Accomplishments

- An end-to-end tool: guided flow, live analysis of any region through the API, plain-language verdicts, region comparison.
- Two demos validated with real data: Iberian warming (+0.26 °C/decade) and opposite rainfall trends in the Western Sahel (wetter) and Central Chile (drier).
- Worldwide trend maps with significance after FDR correction and variable-appropriate color scales.
- Shared contracts from Python to TypeScript, verified in CI.

### What we learned

- Removing seasonality and choosing the right significance test matter as much as the visualization.
- Students need simple definitions and a clear verdict, not only charts.
- Static precomputation is a practical way to keep a free deployment responsive.
- Statistical significance and practical significance are different questions.

### What's next

- Add satellite-only variables (sea surface temperature, aerosols, vegetation) through NASA Giovanni / GES DISC.
- Daily data and seasonal (per-month) trends.
- Detect non-linear change and breakpoints.
- Add an optional Spanish/English selector.

### Built with

React, Vite, TypeScript, MapLibre GL, Plotly, Python, FastAPI, Pydantic, pymannkendall, uv, Docker, GitHub Actions, Vercel, Render.

### Data sources

NASA POWER (meteorology from MERRA-2, solar radiation from CERES/GEWEX). Details, validation and citation in `docs/data-sources.md`.

## AI usage declaration

Copy this text into the Space Apps project page and keep it in the README:

> AI usage declaration: Code and documentation for this project were developed with the assistance of AI coding agents: omp (oh-my-pi) running Anthropic Claude models, and opencode. AI was used for code generation, refactoring, tests, data validation scripts and documentation; every change was reviewed and merged by the team through pull requests with automated tests. No AI-generated images, video or audio are included. NASA data is used according to the dataset terms listed in the README.

## Demo

Space Apps accepts a video of **30 seconds or less** or **up to 7 slides**. The following storyboard uses 6 slides and a 30-second script.

### Storyboard

1. **Title** — Earth System Trend Detective. One sentence: "Find out what is changing, where, and whether it is significant."
2. **The problem** — The same variable can trend in opposite directions in two regions. Show the trend map with blue and red areas.
3. **Choose** — Pick a variable, a region and a period. Show the catalog and the map.
4. **Look** — Show the raw series, the deseasonalized series and the trend line.
5. **Verdict** — Show direction, magnitude in units per decade, p-value and "statistically significant".
6. **Compare and act** — Compare two regions with opposite trends and invite the viewer to try the demo.

### 30-second script

| Time | Voice-over | Visual |
|---|---|---|
| 0–4 s | "Earth is always changing. But where, and how much?" | Title and a rotating globe or map. |
| 4–9 s | "The same variable can rise in one region and fall in another." | Trend map with blue and red regions. |
| 9–15 s | "Pick a variable, a region and a period." | Variable catalog and region selection. |
| 15–21 s | "We remove the seasonal cycle and estimate the trend." | Raw series, deseasonalized series and trend line. |
| 21–26 s | "The verdict shows the change per decade and whether it is significant." | Verdict card with p-value. |
| 26–30 s | "Become an Earth System Trend Detective." | Logo-free end card with the project URL. |

## Links

| Link | URL | Estado |
|---|---|---|
| GitHub | https://github.com/Alanzphy/Earth-System-Trend-Detective | Público |
| Web app | https://earth-system-trend-detective-xi.vercel.app | Público (Vercel) |
| API health | https://estd-api-8l11.onrender.com/health | Público (Render, plan free) |
| Space Apps project page | Añadir URL pública del proyecto | Pendiente |

## Before submitting

- [x] Publicar la UI en Vercel.
- [x] Configurar `CORS_ORIGINS` en Render con la URL de Vercel.
- [x] Verificar que `GET /health` responde en producción.
- [ ] Publicar la página del proyecto en inglés con el texto de arriba.
- [ ] Grabar el video de ≤ 30 s o exportar las 6 diapositivas.
- [ ] Añadir el link de la página del proyecto al README.
- [ ] Confirmar la declaración de IA en la página.
- [ ] Revisar que no haya logos, banderas ni identificadores de misión de NASA en el contenido generado.

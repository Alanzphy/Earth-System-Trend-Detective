# Entrega Space Apps

> Estado de la entrega y textos listos para copiar en la página del proyecto. La página y el video/diapositivas se suben a `spaceappschallenge.org`.

## Checklist mínimo

| Requisito | Estado | Evidencia |
|---|---|---|
| Página del proyecto en inglés | Texto listo; falta publicarla | Sección "Project page copy" |
| Demo de ≤ 30 s o ≤ 7 diapositivas | Guion y storyboard listos; falta grabar/exportar | Sección "Demo" |
| Declaración de uso de IA en la página y en el README | Lista | `README.md` y sección "AI usage declaration" |
| Sin logos ni elementos de marca de NASA | Cumplido | El repo no incluye logos ni identificadores de misión |
| Links públicos sin contraseña | GitHub público; faltan Vercel y página del proyecto | Sección "Links" |
| README en inglés con créditos de datasets NASA | Cumplido | `README.md` |
| Datos y recursos de NASA usados | Cumplido | `docs/data-sources.md` |

## Project page copy

### Title

Earth System Trend Detective

### Elevator pitch

A student-friendly tool that turns NASA Earth science data into a detective story: pick a variable and a region, see how it changes over time, and find out whether the trend is statistically significant.

### Inspiration

Earth's environment is always changing. A variable can rise in one region and fall in another, even when the same process drives both. NASA satellites and models measure many variables, but students need help choosing which ones show change and understanding what the numbers mean.

### What it does

- Lets students explore variables such as air temperature, precipitation, humidity, wind, solar radiation, soil moisture, sea surface temperature, aerosols and vegetation.
- Shows a time series, a deseasonalized series and a trend line for a selected region and period.
- Reports the direction, magnitude in units per decade, p-value and significance in plain language.
- Compares regions to reveal opposite trends of the same variable.
- Includes a precomputed pixel trend map that shows where change is happening, with statistically significant areas highlighted and non-significant areas faded.
- Keeps demos and maps available as static files, so the landing page still works when the free backend is asleep.

### How we built it

- React, Vite, TypeScript, MapLibre GL and Plotly for the interface.
- FastAPI and Pydantic for the backend and contracts.
- Theil–Sen for the trend slope and Mann–Kendall for significance.
- NASA POWER and Giovanni Time Series for area-averaged data.
- A static pipeline for demos and pixel trend maps.
- GitHub Actions for linting, tests and type checks.

### Challenges

- Regional trends can be noisy and seasonal, so the seasonal cycle must be removed before testing.
- A trend can be real but not statistically significant; the interface must explain that difference without misleading students.
- NASA services can be slow or require authentication, so the user experience needs caching, clear loading states and static demos.
- The same variable can show opposite trends in nearby regions, which is exactly the behavior the tool should make visible.

### Accomplishments

- A working API scaffold with health checks, configuration, caching and fixture/real adapters.
- A React interface with MapLibre and Plotly, English by default.
- A static pixel trend map with a diverging scale, significance fading and click-to-region interaction.
- Documentation for demos, variables, regions, data sources and submission requirements.
- CI for Python and UI checks.

### What we learned

- Removing seasonality and choosing the right significance test matter as much as the visualization.
- Students need simple definitions and a clear verdict, not only charts.
- Static precomputation is a practical way to keep a free deployment responsive.
- Statistical significance and practical significance are different questions.

### What's next

- Complete the guided flow and verdict screens.
- Connect the real NASA data adapters.
- Add more variables, regions and demos.
- Publish generated trend maps from the pipeline.
- Add an optional Spanish/English selector.

### Built with

React, Vite, TypeScript, MapLibre GL, Plotly, Python, FastAPI, Pydantic, pymannkendall, uv, Docker, GitHub Actions, Vercel, Render.

### Data sources

NASA POWER, NASA GES DISC Giovanni, NASA Earthdata, NASA GLDAS, NASA MERRA-2, NASA MODIS, NASA GPM, NASA Worldview and CUAHSI. Details and links are in `docs/data-sources.md`.

## AI usage declaration

Copy this text into the Space Apps project page and keep it in the README:

> AI usage declaration: Code and documentation for this project were developed with the assistance of AI coding agents (opencode). AI was used for code generation, refactoring, tests and documentation. No AI-generated images or videos are included. NASA data is used according to the dataset terms listed in the README.

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
| API health | https://estd-api.onrender.com/health | Render; confirmar URL final |
| Web app | Añadir URL de producción de Vercel | Pendiente |
| Space Apps project page | Añadir URL pública del proyecto | Pendiente |

## Before submitting

- [ ] Publicar la UI en Vercel y añadir la URL.
- [ ] Configurar `CORS_ORIGINS` en Render con la URL de Vercel.
- [ ] Verificar que `GET /health` responde en producción.
- [ ] Publicar la página del proyecto en inglés con el texto de arriba.
- [ ] Grabar el video de ≤ 30 s o exportar las 6 diapositivas.
- [ ] Añadir los links públicos a la página del proyecto y al README.
- [ ] Confirmar la declaración de IA en la página y en el README.
- [ ] Revisar que no haya logos, banderas ni identificadores de misión de NASA en el contenido generado.

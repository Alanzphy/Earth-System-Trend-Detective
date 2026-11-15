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

Chihuahua, Mexico, has warmed about 2.4 °C since 1981 and lost about a third of its rain. Earth System Trend Detective turns a student's phone into a scientific instrument: pick your town, read 45 years of NASA data, and find out what changed, how much, and whether it is real — then keep the evidence as your own case card.

### Inspiration

We give workshops in public schools in Chihuahua, a farming region hit by drought. The data about how the climate is changing exists — decades of NASA satellite-based and model data — but it does not reach the young people who will live from this land, in a form they can understand. Phones were made to consume; we wanted students to use theirs to investigate. The challenge asks exactly this: help students find what changes, where, how much, and whether it is significant.

### What it does

- **Pick a place**: eight zones of Chihuahua, the whole state, world regions, or any area drawn on a map or typed as coordinates.
- **Case card**: what changed there since 1981 for eight NASA POWER variables at once (heat, rain, soil moisture, evaporation, humidity, sunlight, wind, water vapor), in units anyone can picture ("+2.4 °C", "−118 mm of rain per year"), with yearly warming stripes. Changes that are not statistically significant say "No clear trend".
- **How we know it's real**: the monthly series with and without the seasons, the trend line, change per decade with 95% confidence interval, p-value, months analyzed and method. Every term opens a simple definition.
- **Save my case card**: an image made on the device with a nickname and school, ready to share. Nothing is uploaded.
- **Cases from Chihuahua**: Delicias is heating up; less rain and drier soil in Cuauhtémoc; all eight zones warmer and drier; the same rain falling in Chihuahua and rising in the Western Sahel.
- **World trend map**: where temperature and rain changed fastest (2.5° cells, false discovery rate correction); any cell can be investigated live.
- Works while the free backend sleeps: places, cases and maps are precomputed static files.

### How we built it

- React, Vite, TypeScript, MapLibre GL and Plotly for the interface; FastAPI and Pydantic for the API and shared contracts.
- NASA POWER monthly regional data (MERRA-2 meteorology, CERES/GEWEX solar radiation), cos(latitude)-weighted area averages, monthly anomalies, Theil–Sen slope per decade and Mann–Kendall test with the Hamed–Rao autocorrelation correction.
- An offline pipeline that precomputes every place with exactly the same code as the live API, plus worldwide 2.5° trend maps with Benjamini–Hochberg FDR correction.
- GitHub Actions for linting, tests and contract/type drift checks.

### Challenges

- Seasons hide slow change: the seasonal cycle must be removed before testing a trend.
- A trend can look real and still be chance; the interface must say "not significant" without suggesting that nothing changed.
- Making statistics readable for 12–18-year-olds without hiding the evidence a scientist would ask for.
- One NASA POWER evapotranspiration parameter is zero most months over dry regions; we found it with the Chihuahua data and switched to land evaporation (EVLAND).

### Accomplishments

- Real, local findings: every Chihuahua zone warmed +2.0 to +2.4 °C and lost 28–39% of its rain since 1981, all statistically significant; the state warms about 2.5 times the average of our world map.
- A complete tool: any place on Earth, eight variables, plain-language verdicts, comparison, shareable case cards, phone-first design.
- Every number in the app comes from the same tested code path; shared contracts from Python to TypeScript are verified in CI.

### What we learned

- Removing seasonality and choosing the right significance test matter as much as the visualization.
- Students need a clear answer first and the evidence one tap away.
- We know our limits: experts in agronomy and statistics should validate what students find, and teachers should shape the activity.

### What's next

- A pilot in the public schools where we already give workshops, and weekly challenges for student clubs (a format like the one Las Niñas Sí Pueden uses).
- Partnering with agronomy and statistics faculty (UACH) to review students' cases.
- A Spanish version, a shared atlas of students' cases, and combining field sensors with satellite records.

### Built with

React, Vite, TypeScript, MapLibre GL, Plotly, Python, FastAPI, Pydantic, pymannkendall, uv, Docker, GitHub Actions, Vercel, Render.

### Data sources

NASA POWER (meteorology from MERRA-2, solar radiation from CERES/GEWEX). Details, validation and citation in `docs/data-sources.md`.

## AI usage declaration

Copy this text into the Space Apps project page and keep it in the README:

> AI usage declaration: Code and documentation for this project were developed with the assistance of AI coding agents: omp (oh-my-pi) running Anthropic Claude models, and opencode. AI was used for code generation, refactoring, tests, data validation scripts and documentation; every change was reviewed and merged by the team through pull requests with automated tests. No AI-generated images, video or audio are included. NASA data is used according to the dataset terms listed in the README.

## Demo

Space Apps accepts a video of **30 seconds or less** or **up to 7 slides**. The submission video (English captions), the dynamic video shown behind the 4-minute pitch, the screenshots and the checks are all specified in **[`video-plan.md`](video-plan.md)**, the single source for that material. Prepared answers for the jury's questions: **[`pitch-qa.md`](pitch-qa.md)**.

### 4-minute pitch (Spanish, 7 slides)

| # | Time | Slide | Message |
|---|---|---|---|
| 1 | 0:00–0:25 | "Chihuahua está en el 4 % de los lugares del mapa que más rápido se calientan: +2.1 °C desde 1981" (stripes + map) | The hook: a real, local number. Never "faster than the planet" (see `pitch-qa.md`). |
| 2 | 0:25–0:55 | The problem: the data exists (NASA, 45 years) but does not reach young people in farming regions; phones are used to consume, not to create | Why it matters. |
| 3 | 0:55–1:40 | **Demo video** (30 s), narrated live | The tool working. |
| 4 | 1:40–2:15 | How we know it's real: seasons removed, robust trend, significance test, "not a forecast" | Validity. |
| 5 | 2:15–2:55 | From consuming to investigating: the student's case card, alias + school, shareable; weekly challenges for clubs | Impact mechanism. |
| 6 | 2:55–3:30 | Who makes it happen: our workshop experience in public schools, experts (UACH, Zootecnia), a format like Las Niñas Sí Pueden as the way to implement it | Feasibility and honesty about limits. |
| 7 | 3:30–4:00 | Next steps: pilot in our schools, Spanish version, collective atlas, field sensors + satellite. Closing line: "Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante de Chihuahua puede convertir el suyo en un instrumento científico." | Vision. |

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
- [ ] Grabar el video de ≤ 30 s (plan en `video-plan.md`).
- [ ] Si el video lo compuso o editó una IA: cambiar en la declaración "No AI-generated images, video or audio are included" por "The pitch and demo videos were composed with AI assistance and carry a visible watermark".
- [ ] Añadir el link de la página del proyecto al README.
- [ ] Confirmar la declaración de IA en la página.
- [ ] Revisar que no haya logos, banderas ni identificadores de misión de NASA en el contenido generado.

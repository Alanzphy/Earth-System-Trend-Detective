# Earth System Trend Detective

NASA Space Apps Challenge 2026. Herramienta para explorar variables del sistema Tierra, visualizar su evolución y evaluar si sus tendencias son significativas.

- Reto: [`docs/challenge.md`](docs/challenge.md)
- Cómo colaborar: [`docs/collaboration.md`](docs/collaboration.md)
- Reglas para agentes: [`AGENTS.md`](AGENTS.md)
- Tareas: GitHub Issues / Projects

## Estructura

```
pyproject.toml workspace de uv (api, data, analysis) + config de ruff/pytest
uv.lock        dependencias Python fijadas
docs/          documentación viva (fuente de verdad)
src/contracts/ esquemas compartidos entre áreas
src/data/      paquete Python `data`: ingesta y caché de datasets
src/analysis/  paquete Python `analysis`: tendencia y significancia
src/api/       paquete Python `app`: backend FastAPI
src/ui/        frontend (pnpm)
```

## Setup

Python (desde la raíz):

```sh
cp .env.example .env
uv sync
uv run ruff check . && uv run pytest
```

Frontend: ver [`src/ui/README.md`](src/ui/README.md). API: ver [`src/api/README.md`](src/api/README.md).

# API

API FastAPI del proyecto. Orquesta `data` y `analysis` y expone catálogo, tendencias y demos a la UI.

Es miembro del workspace de uv de la raíz (`pyproject.toml`), junto con `src/data` y `src/analysis`. Todos los comandos se ejecutan **desde la raíz del repo**.

## Requisitos

- Python 3.12+ y [uv](https://docs.astral.sh/uv/)
- Docker (opcional)

## Desarrollo local

```sh
cp .env.example .env
uv sync
uv run uvicorn app.main:app --reload
```

Documentación interactiva: `http://localhost:8000/docs`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio para Render. |

El catálogo, la tendencia y las demos se implementan en los issues #6 y #7.

## Configuración

Variables en `.env` (plantilla: `.env.example` de la raíz).

| Variable | Descripción | Default |
|---|---|---|
| `EARTHDATA_TOKEN` | Token de NASA Earthdata. | vacío |
| `CORS_ORIGINS` | Orígenes permitidos, como lista JSON. | `["http://localhost:5173"]` |
| `CACHE_TTL_SECONDS` | TTL de la caché en memoria. | `900` |
| `REQUEST_TIMEOUT_SECONDS` | Timeout de llamadas a datos. | `30` |
| `DATA_ADAPTER` | `fixture` o `real`. | `fixture` |

## Adaptadores

- `fixture`: datos deterministas (ciclo estacional + 0.02 °C/mes = 2.4 °C/década) para tests y para el corte vertical mientras `data` y `analysis` no existen.
- `real`: delega en `data.get_series` y `analysis.compute_trend`, instalados como paquetes del workspace.

## Verificación

```sh
uv run ruff check .
uv run pytest
```

## Docker

El contexto de build es la raíz, porque la imagen incluye `data` y `analysis`:

```sh
docker build -f src/api/Dockerfile -t estd-api .
docker run --rm -p 8000:8000 estd-api
```

En Render: *Dockerfile Path* `src/api/Dockerfile`, *Docker Build Context* `.`. Render inyecta `PORT` y la imagen lo respeta.

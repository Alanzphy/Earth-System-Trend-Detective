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
| GET | `/variables` | Catálogo (`CatalogResponse`). |
| POST | `/trend` | `TrendRequest` → `AnalysisResponse`. Errores como `ErrorResponse`: `unknown_variable` (404), `invalid_request`, `region_too_large` (> 40°), `no_data`, `insufficient_data` (422), `upstream_unavailable` (502/503). |

Respuestas de `/trend` en caché en memoria (`CACHE_TTL_SECONDS`) por petición.

## Configuración

Variables en `.env` (plantilla: `.env.example` de la raíz).

| Variable | Descripción | Default |
|---|---|---|
| `EARTHDATA_TOKEN` | Token de NASA Earthdata. | vacío |
| `CORS_ORIGINS` | Orígenes permitidos, como lista JSON. | `["http://localhost:5173"]` |
| `CACHE_TTL_SECONDS` | TTL de la caché en memoria. | `900` |
| `REQUEST_TIMEOUT_SECONDS` | Timeout de llamadas a datos. | `30` |
| `DATA_ADAPTER` | `power` (NASA POWER) o `fixture` (serie sintética, sin red). | `power` |

## Fuentes de datos

- `power`: `data.get_series` (NASA POWER) + `analysis.compute_trend`.
- `fixture`: misma lista de variables, serie sintética (ciclo estacional + 0.02 unidades/mes); útil sin red. El análisis es siempre el real.

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

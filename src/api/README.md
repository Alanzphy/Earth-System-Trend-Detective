# API

API FastAPI del proyecto. Orquesta `data` y `analysis` y expone catálogo, tendencias y demos a la UI.

## Requisitos

- Python 3.12+
- Docker (opcional)

## Desarrollo local

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Con `uv`:

```powershell
uv sync --extra dev
uv run uvicorn app.main:app --reload
```

Documentación interactiva: `http://localhost:8000/docs`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio para Render. |

El catálogo, la tendencia y las demos se implementan en los issues #6 y #7.

## Configuración

Copiar `.env.example` a `.env` y ajustar las variables.

| Variable | Descripción | Default |
|---|---|---|
| `EARTHDATA_TOKEN` | Token de NASA Earthdata. | vacío |
| `CORS_ORIGINS` | Orígenes permitidos, como lista JSON. | `["http://localhost:5173"]` |
| `CACHE_TTL_SECONDS` | TTL de la caché en memoria. | `900` |
| `REQUEST_TIMEOUT_SECONDS` | Timeout de llamadas a datos. | `30` |
| `DATA_ADAPTER` | `fixture` o `real`. | `fixture` |

## Adaptadores

- `fixture`: datos deterministas para tests y para el corte vertical mientras `data` y `analysis` no existen.
- `real`: delega en `data.get_series` y `analysis.compute_trend`.

Los adaptadores reales se activan cuando existan las interfaces e implementaciones de los issues de `data` y `analysis`.

## Verificación

```powershell
ruff check .
pytest
```

## Docker

```powershell
docker build -t estd-api .
docker run --rm -p 8000:8000 estd-api
```

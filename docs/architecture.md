# Arquitectura

> Estado: **borrador**. Los contratos de abajo son la referencia hasta migrarlos a modelos Pydantic en `src/contracts/`.

## Componentes

```mermaid
flowchart LR
  UI[ui: preguntas, mapa, gráficos] -->|request| API[api]
  API --> DATA[data: ingesta + cache]
  API --> AN[analysis: desestacionalizar, tendencia, significancia]
  DATA --> SRC[(NASA APIs / datasets)]
  AN --> DATA
```

| Área | Responsabilidad | Carpeta |
|---|---|---|
| data | Descargar/subconjuntar variables por región y periodo; cache | `src/data/` |
| analysis | Agregación, remoción estacional, tendencia, significancia | `src/analysis/` |
| api | Exponer catálogo y resultados | `src/api/` |
| ui | Flujo guiado, mapa, gráficos, demos | `src/ui/` |

## Contratos

### Serie temporal (data → analysis)

```json
{
  "variable": "string (id del catálogo)",
  "units": "string",
  "region": { "type": "bbox", "coords": [minLon, minLat, maxLon, maxLat] },
  "resolution": "daily | monthly",
  "time": ["ISO-8601"],
  "values": [number | null],
  "source": "id en data-sources.md"
}
```

### Resultado de tendencia (analysis → api/ui)

```json
{
  "method": "mann-kendall+sen | ols",
  "deseasonalized": true,
  "slope": number,
  "slope_units": "units/decade",
  "p_value": number,
  "significant": boolean,
  "alpha": 0.05,
  "ci": [low, high],
  "n": integer,
  "period": ["ISO-8601", "ISO-8601"]
}
```

## API

Implementada en `src/api/` (issue #5). Endpoints disponibles:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio para Render. |

El catálogo, la tendencia y las demos se añaden en los issues #6 y #7.

## Stack

Decidido en [`decisions/2026-11-14-stack.md`](decisions/2026-11-14-stack.md):

- **Frontend**: React + Vite + TypeScript · MapLibre GL · Plotly · pnpm · eslint + vitest · Vercel
- **Backend**: Python 3.12 + FastAPI en Docker · consulta series ya promediadas de NASA POWER / Giovanni Time Series · pymannkendall · uv · ruff + pytest · Render (gratis)
- **Precalculado**: pipeline Python (xarray, earthaccess) en GitHub Actions → mapas de tendencia y demos como archivos estáticos
- **Contratos**: Pydantic (`src/contracts/`) → OpenAPI → tipos TS (`openapi-typescript`)
- **Sin base de datos**: caché temporal en el backend

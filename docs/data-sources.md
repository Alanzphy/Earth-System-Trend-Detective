# Fuentes de datos

> Añadir cada fuente con cita. Verificar acceso (auth, formato, latencia) antes de marcarla como ✅.

## Fuentes

| ID | Fuente | Uso | Resolución | Acceso | Estado |
|---|---|---|---|---|---|
| `power` | [NASA POWER](https://power.larc.nasa.gov/) — Monthly & Annual API v2.10 | Todas las variables del MVP | mensual, rejilla 0.5° lat × 0.625° lon (MERRA-2) | REST, sin autenticación | ✅ validada (#3) |
| `giovanni` | [NASA GES DISC Giovanni](https://giovanni.gsfc.nasa.gov/) | SST, aerosoles, NDVI (futuro) | mensual | Earthdata Login | 🔍 fuera del MVP |
| `gldas` | [NASA GLDAS](https://ldas.gsfc.nasa.gov/gldas/) | Humedad del suelo alternativa (futuro) | mensual | Earthdata Login / GES DISC | 🔍 fuera del MVP |
| `cuahsi` | [CUAHSI](https://www.cuahsi.org/) | Caudal (futuro) | variable | Web/API | 🔍 fuera del MVP |

Estados: 🔍 por evaluar · ✅ integrada · ❌ descartada (motivo).

**Cita de NASA POWER**: "These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program." Datos meteorológicos derivados de MERRA-2; radiación de CERES/GEWEX.

## Validación de NASA POWER (#3)

Probado el 2026-11-14 contra `https://power.larc.nasa.gov/api/temporal/monthly`:

| Aspecto | Resultado |
|---|---|
| Endpoint `point` | 1 punto, 1981-01 → 2025-12 completo, ~1 s |
| Endpoint `regional` | Devuelve todos los puntos de rejilla dentro del bbox (GeoJSON). 8° × 10° = 272 puntos, ~1 s, ~2.3 MB por variable para 1981–2025 |
| Límites del bbox `regional` | **mínimo 2°** y **máximo 10°** de rango en latitud y en longitud. Regiones mayores se dividen en teselas de ≤ 10° |
| Periodo disponible | 1981-01 → 2025-12 (radiación desde 1984-01) |
| Formato mensual | Claves `YYYYMM`; **`YYYY13` es el promedio anual y se descarta**. Faltantes = `-999` |
| Autenticación | Ninguna |

Promedio por área: se calcula en `data` con ponderación por coseno de la latitud sobre los puntos de rejilla devueltos.

**Giovanni**: requiere Earthdata Login (token validado contra GES DISC). Su servicio de series temporales no se integra en el MVP; las variables que solo tiene Giovanni (SST, aerosoles, NDVI) quedan como trabajo futuro.

## Variables del catálogo (MVP)

| Variable ID | Parámetro POWER | Unidad publicada | Unidad mostrada | Nota |
|---|---|---|---|---|
| `temperature_2m` | `T2M` | °C | °C | |
| `precipitation` | `PRECTOTCORR` | mm/día | mm/día | Precipitación corregida (MERRA-2 ajustada con GPCP) |
| `relative_humidity_2m` | `RH2M` | % | % | |
| `specific_humidity_2m` | `QV2M` | g/kg | g/kg | |
| `wind_speed_10m` | `WS10M` | m/s | m/s | |
| `solar_radiation` | `ALLSKY_SFC_SW_DWN` | MJ/m²/día | kWh/m²/día | ÷ 3.6. Disponible desde 1984 |
| `evapotranspiration` | `EVPTRNS` | MJ/m²/día | mm/día | ÷ 2.45 (calor latente de vaporización) |
| `soil_wetness_root` | `GWETROOT` | fracción 0–1 | fracción 0–1 | Humedad en la zona de raíces |

## Implementación (`src/data/`, #20)

| Módulo | Contenido |
|---|---|
| `data/catalog.py` | Las 8 variables como `contracts.Variable` + divisor de conversión de unidades. `get_catalog() -> CatalogResponse` |
| `data/power.py` | `PowerClient`: cliente httpx del endpoint `regional` mensual. Teselado, ensanchado, parseo y caché |
| `data/series.py` | `fetch_grid(variable, bbox, start, end) -> Grid` y `get_series(variable, bbox, start, end) -> TimeSeries` |
| `data/errors.py` | `UnknownVariableError`, `NoDataError`, `UpstreamError(retryable, status_code)`; todas heredan de `DataError` y tienen `code` para `ErrorResponse` |

Flujo de `get_series`:

1. Busca la variable en el catálogo (`UnknownVariableError` si no existe) y recorta `start`/`end` (`YYYY-MM`, inclusivos) al periodo disponible (`NoDataError` si no hay solapamiento).
2. Pide a POWER los **años completos** necesarios. El bbox se divide en teselas iguales de ≤ 10° por eje; si un eje mide < 2°, se ensancha a 2° alrededor del centro.
3. Descarta las claves `YYYY13`, convierte `-999` en NaN, elimina puntos repetidos en los bordes compartidos entre teselas y conserva solo los puntos dentro del bbox pedido (o el más cercano al centro si no hay ninguno).
4. `fetch_grid` recorta a los meses pedidos y aplica la conversión de unidades (radiación ÷ 3.6, evapotranspiración ÷ 2.45). Devuelve `Grid(lons, lats, time, values[puntos, meses], units)`, que también usa el pipeline de mapas de tendencia.
5. `get_series` promedia cada mes con peso `cos(lat)` ignorando NaN (`null` si ningún punto tiene dato), redondea a 4 decimales y pone `grid_points` = número de puntos promediados.

**Red y errores**: timeout por petición = argumento `timeout` o `ESTD_POWER_TIMEOUT_SECONDS` (60 s por defecto). Un reintento ante timeout, error de red o HTTP 5xx; si falla de nuevo, `UpstreamError(retryable=True)`. Un 4xx (p. ej. 422 por parámetros inválidos) da `UpstreamError(retryable=False)` con el mensaje de POWER. POWER no usa `EARTHDATA_TOKEN`.

**Caché**:

- En memoria (por `PowerClient`; `get_series`/`fetch_grid` comparten uno por proceso): LRU de 64 teselas con TTL `ESTD_CACHE_TTL_SECONDS` (24 h por defecto). Clave: `(parámetro, bbox de la tesela, año inicial, año final)`.
- En disco (opcional): si `ESTD_CACHE_DIR` está definido, guarda la respuesta JSON cruda de cada tesela como `<PARAM>_<bbox>_<años>.json` y la reutiliza sin caducidad (son datos históricos). Desactivado por defecto; en desarrollo usar `ESTD_CACHE_DIR=src/data/cache` (ignorado por git).

**Tests**: `src/data/tests/` usa `httpx.MockTransport` con una respuesta grabada en `tests/fixtures/` (sin red).

**Verificación real** (2026-11-14): Iberia `[-10, 36, 3, 44]`, `temperature_2m`, 1981-01 → 2025-12: 2 teselas, 357 puntos de rejilla, 540 meses sin huecos, 1981-01 = 7.6875 °C, 2025-12 = 9.8661 °C, ~2 s.

## Credenciales

`EARTHDATA_TOKEN` en `.env` y en Render (ver `.env.example`). NASA POWER no lo necesita. Nunca commitear valores.

## Recursos oficiales del reto

- [Challenge: Be An Earth System Trend Detective!](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/)
- [Space Apps judging guidelines](https://assets.spaceappschallenge.org/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf)
- [NASA Earthdata](https://www.earthdata.nasa.gov/)
- [NASA GES DISC](https://disc.gsfc.nasa.gov/)
- [NASA POWER](https://power.larc.nasa.gov/)
- [NASA Giovanni](https://giovanni.gsfc.nasa.gov/)
- [NASA GLDAS](https://ldas.gsfc.nasa.gov/gldas/)
- [NASA MERRA-2](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)
- [NASA MODIS](https://modis.gsfc.nasa.gov/)
- [NASA GPM](https://gpm.nasa.gov/)
- [NASA Worldview](https://worldview.earthdata.nasa.gov/)
- [CUAHSI](https://www.cuahsi.org/)

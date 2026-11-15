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

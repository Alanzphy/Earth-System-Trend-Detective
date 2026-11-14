# Fuentes de datos

> Añadir cada fuente con cita. Verificar acceso (auth, formato, latencia) antes de marcarla como ✅.

## Fuentes previstas

| ID | Fuente | Variables | Resolución | Acceso | Estado |
|---|---|---|---|---|---|
| `power` | [NASA POWER](https://power.larc.nasa.gov/) | `temperature_2m`, `precipitation`, `relative_humidity_2m`, `wind_speed_10m`, `solar_radiation`, `evaporation`, `soil_moisture` | diaria/mensual | REST, sin auth | 🔍 por validar en #3 |
| `giovanni` | [NASA GES DISC Giovanni](https://giovanni.gsfc.nasa.gov/) | `precipitation`, `sea_surface_temperature`, `aerosol_optical_depth`, `ndvi` | mensual | Web/API, Earthdata Login | 🔍 por validar en #3 |
| `gldas` | [NASA GLDAS](https://ldas.gsfc.nasa.gov/gldas/) | `soil_moisture` | mensual | Earthdata Login / GES DISC | 🔍 por validar en #3 |
| `cuahsi` | [CUAHSI](https://www.cuahsi.org/) | caudal, hidrología | variable | Web/API | 🔍 por evaluar |

Estados: 🔍 por evaluar · ✅ integrada · ❌ descartada (motivo).

## Variables del catálogo

| Variable ID | Fuente primaria | Fuente alternativa | Unidad | Cita / enlace |
|---|---|---|---|---|
| `temperature_2m` | `power` | `giovanni` | °C | [NASA POWER](https://power.larc.nasa.gov/) |
| `precipitation` | `power` | `giovanni` | mm/día | [NASA POWER](https://power.larc.nasa.gov/) · [Giovanni](https://giovanni.gsfc.nasa.gov/) |
| `relative_humidity_2m` | `power` | — | % | [NASA POWER](https://power.larc.nasa.gov/) |
| `wind_speed_10m` | `power` | — | m/s | [NASA POWER](https://power.larc.nasa.gov/) |
| `solar_radiation` | `power` | — | kWh/m²/día | [NASA POWER](https://power.larc.nasa.gov/) |
| `evaporation` | `power` | `giovanni` | mm/día | [NASA POWER](https://power.larc.nasa.gov/) · [Giovanni](https://giovanni.gsfc.nasa.gov/) |
| `soil_moisture` | `power` | `gldas` | m³/m³ | [NASA POWER](https://power.larc.nasa.gov/) · [GLDAS](https://ldas.gsfc.nasa.gov/gldas/) |
| `sea_surface_temperature` | `giovanni` | — | °C | [Giovanni](https://giovanni.gsfc.nasa.gov/) |
| `aerosol_optical_depth` | `giovanni` | — | adimensional | [Giovanni](https://giovanni.gsfc.nasa.gov/) |
| `ndvi` | `giovanni` | — | adimensional | [Giovanni](https://giovanni.gsfc.nasa.gov/) |

## Credenciales

Documentar en `.env.example` (p. ej. `EARTHDATA_TOKEN`). Nunca commitear valores.

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

El enunciado menciona MODIS, OMI, AIRS, GPM, MERRA-2 y GLDAS como fuentes de variables analizables. El catálogo inicial prioriza las fuentes con series ya promediadas por región para el MVP.

# Validación independiente de las cifras de Chihuahua

> ¿Las cifras de la app (NASA POWER, 1981–2025) se sostienen con otras fuentes? Este documento las contrasta con un reanálisis independiente (ERA5, de Europa) y con el análisis oficial del gobierno de México basado en estaciones (INECC, 2019). Fecha: 2026-11-15.

## Resumen

| Afirmación | NASA POWER (app) | ERA5 (ECMWF, independiente) | INECC 2019 (estaciones SMN, 1985–2018) | Veredicto |
|---|---|---|---|---|
| **Chihuahua se calienta** | +0.48 °C/década, estado; +0.53 Delicias; +0.50 Cuauhtémoc; significativo en todos los periodos probados | Delicias **+0.68**, Cuauhtémoc **+0.58 °C/década**, p < 10⁻¹⁴ | Tmax **+0.74** y Tmin **+1.03 °C/década**, ambas significativas | **Confirmado por tres fuentes independientes. La cifra de la app es la más prudente.** |
| **Llueve menos** | −32 % estado, −34 % Delicias, −34 % Cuauhtémoc (1981–2025), significativo | Delicias **−45 %**, Cuauhtémoc **−32 %**, p < 0.001 (1981–2025) | +2.7 mm/año, **no significativo**: "no tiene cambios" (1985–2018) | **Depende del periodo.** Real y significativo en 1981–2025 con dos reanálisis, pero con estaciones hasta 2018 no hay cambio claro, y NASA en ese mismo periodo tampoco lo detecta. |

**Conclusión para el pitch**: el calentamiento es un **dato duro**. La caída de lluvia es real en el periodo completo, pero la pesa la sequía reciente: no debe ser el gancho y siempre debe decirse con su periodo.

## 1. ERA5 (reanálisis europeo, independiente de NASA)

- **Fuente**: ERA5, de ECMWF/Copernicus, servido por la API de archivo de Open-Meteo (`models=era5`), con datos diarios de temperatura media a 2 m y lluvia de 1981-01-01 a 2025-12-31.
- **Por qué es independiente**: NASA POWER usa el reanálisis MERRA-2 (NASA GMAO). ERA5 es otro modelo, de otra institución, con otra asimilación de observaciones.
- **Método**: una malla de 4 × 4 puntos dentro de cada zona de 2° × 2° (6 × 6 para el estado), promediada con peso cos(latitud), agregada a meses y analizada con **exactamente el mismo código de la app** (`analysis.trend.compute_trend`: anomalías mensuales, Theil–Sen, Mann–Kendall con Hamed–Rao).

| Zona | Variable | NASA POWER | ERA5 |
|---|---|---|---|
| Delicias | Temperatura | +2.37 °C (+0.527/década) | **+3.05 °C** (+0.678/década, p = 6 × 10⁻¹⁵) |
| Delicias | Lluvia | −118 mm/año (−34 %), p = 0.001 | **−159 mm/año (−45 %)**, p < 0.001 |
| Delicias | Lluvia media anual | 348 mm | 350 mm |
| Cuauhtémoc | Temperatura | +2.26 °C (+0.501/década) | **+2.62 °C** (+0.582/década, p = 1 × 10⁻¹⁵) |
| Cuauhtémoc | Lluvia | −167 mm/año (−34 %), p = 0.011 | **−154 mm/año (−32 %)**, p < 0.001 |
| Cuauhtémoc | Lluvia media anual | 493 mm | 486 mm |

El estado completo no se pudo calcular con ERA5: la API limitó las peticiones (HTTP 429). Para el estado, la comparación independiente es la del INECC.

## 2. INECC 2019 (gobierno de México, estaciones del SMN)

Fuente: [Plataforma Estados y Municipios, Chihuahua](https://cambioclimatico.gob.mx/estadosymunicipios/Vulnerabilidad/V_08.html) (INECC, 2019). Regresión lineal sobre series anuales estatales de **1985–2018**, con significancia al 95 %:

> "La tendencia de Tmax (+0.074 °C/año) y Tmin (+0.103 °C/año) son significativas, mientras que la de Pcp (+2.678 mm/año) es no significativa. Por lo tanto, para el periodo de 1985-2018 en el estado de Chihuahua Tmax y Tmin anuales están siendo más cálidas, y Pcp acumulada anual no tiene cambios."

La misma página reporta que **las sequías fueron los desastres climáticos más frecuentes del estado entre 1999 y 2018** (declaratorias en 175 municipios entre 2000 y 2011).

## 3. Sensibilidad al periodo (NASA POWER, mismo código)

| Estado de Chihuahua | Temperatura | Lluvia |
|---|---|---|
| 1981–2025 (app) | +0.048 °C/año, p < 10⁻¹² | −32 %, p < 0.001 |
| **1985–2018 (periodo del INECC)** | +0.043 °C/año, p < 10⁻⁴ | −11 %, **p = 0.26 (no significativo)** |
| 1985–2025 | +0.050 °C/año, p < 10⁻¹⁰ | −24 %, p = 0.014 |
| 1981–2019 (sin la sequía reciente) | — | p = 0.028 |

La temperatura es significativa con cualquier periodo. La lluvia depende de los extremos: los años húmedos de principios de los 80 y la sequía de 2020–2024.

## Qué se puede decir y qué no

- ✅ "Chihuahua se calienta, y lo confirman NASA, el reanálisis europeo ERA5 y las estaciones del gobierno."
- ✅ "La cifra de la app (+2.1 °C en el estado, +2.4 °C en Delicias) es la estimación más prudente de las tres fuentes."
- ✅ "Desde 1981 llueve menos, sobre todo por la sequía de los últimos años." (Siempre con el periodo.)
- ❌ "Llueve un tercio menos" como gancho o sin periodo: con estaciones hasta 2018 no hay tendencia clara.
- ❌ "Nadie lo sabía": el INECC publica el calentamiento estatal. Lo que **no** está publicado es la cifra **por zona** (Delicias, Cuauhtémoc…) hasta 2025, en unidades simples y comparada con el resto del mundo. Eso lo calculamos nosotros.

## Cómo reproducirlo

- NASA POWER: `src/ui/public/regions/*.json`, generado con `uv run python -m pipeline regions`.
- ERA5: `https://archive-api.open-meteo.com/v1/archive` con `models=era5`, `daily=temperature_2m_mean,precipitation_sum` y la malla descrita arriba, analizado con `analysis.trend.compute_trend`.

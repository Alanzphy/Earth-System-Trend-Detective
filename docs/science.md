# Métodos científicos

## Pipeline implementado

`analysis.compute_trend(series, alpha=0.05, variable_name=None) -> AnalysisResponse` (`src/analysis/analysis/trend.py`). Función pura: recibe un `TimeSeries` mensual y no hace red ni I/O.

1. **Agregación espacial** (área `data`): media ponderada por área (coseno de latitud) de los puntos de la región.
2. **Validación**: `time` debe ser estrictamente creciente (`ValueError` si no). Se requieren **≥ 24 meses con dato**; si no, `InsufficientDataError`. 24 meses distintos siempre abarcan al menos 2 años.
3. **Desestacionalización**: climatología = media de cada mes calendario (enero, febrero, …) sobre el periodo seleccionado, ignorando faltantes. Anomalía = valor − climatología de su mes; queda `null` donde el valor es `null`.
4. **Tendencia (Theil–Sen)**: `scipy.stats.theilslopes` sobre (meses desde el inicio del periodo, anomalías), descartando faltantes pero conservando la posición temporal real de cada mes. Pendiente e IC 95 % se multiplican por 120 para darlos **por década**.
5. **Significancia (Mann–Kendall + Hamed–Rao)**: `pymannkendall.hamed_rao_modification_test` sobre las anomalías sin faltantes, con `lag=12` (solo los primeros 12 rezagos de autocorrelación que sean significativos entran en la corrección de la varianza). Prueba bilateral.
   - Con todos los rezagos (valor por defecto de la librería) la corrección es demasiado ruidosa: en simulaciones con ruido blanco de 540 meses rechazaba ~11 % de las veces con α = 0.05; con 12 rezagos, ~6 %. Con ruido AR(1) φ = 0.9 (persistencia fuerte, sin tendencia), Mann–Kendall sin corrección marca tendencia en ~60 % de los casos y Hamed–Rao (12 rezagos) en ~11 %.
   - Si la autocorrelación negativa hace que la varianza corregida sea ≤ 0, se usa el Mann–Kendall original, que en ese caso es conservador.
6. **Decisión**: `significant = p_value < alpha`. `direction` = `increasing`/`decreasing` según el signo de la pendiente Theil–Sen **solo si es significativa**; si no, `no trend`.
7. **Salida** (`AnalysisResponse`):
   - `anomalies`: serie desestacionalizada.
   - `trend_line`: `intercepto + pendiente × t` para todos los meses del periodo (escala de anomalías, sin huecos).
   - `trend`: `method = "Theil–Sen slope + Mann–Kendall (Hamed–Rao)"`, `deseasonalized = true`, `slope_per_decade`, `slope_units = "<unidades>/decade"`, `ci_low`/`ci_high`, `p_value`, `alpha`, `significant`, `direction`, `total_change = slope_per_decade × (meses del periodo / 120)`, `n` = meses con dato, `period_start`/`period_end` = primer y último mes del periodo.
   - `verdict`: texto para estudiantes (ver abajo).

### Advertencia sobre el IC

El IC 95 % de Theil–Sen **no tiene en cuenta la autocorrelación**: supone meses independientes, así que es una **cota inferior de la incertidumbre** real de la pendiente. El p-valor sí la tiene en cuenta (Hamed–Rao). Por eso la significancia se decide con el p-valor, no con si el IC cruza el cero.

## Veredicto (`verdict`)

En inglés, una o dos frases. Nombre de la variable = `variable_name` (o `series.variable`). Magnitud con 2 cifras significativas. Periodo `1981–2025` si empieza en enero y termina en diciembre; si no, `YYYY-MM to YYYY-MM`. p-valor como `p < 0.001` si es menor; si no, 2 cifras significativas **truncadas** (nunca redondea hacia arriba, así un p = 0.0499 no aparece como 0.05).

- **Significativa** (p < α): "Air temperature at 2 m increased by about 0.26 °C per decade (1981–2025). This trend is statistically significant (p < 0.001): it is very unlikely to be just chance." ("very unlikely" si p < 0.01; "unlikely" si no).
- **No significativa** (p ≥ α): "For precipitation, the estimated change is +0.012 mm/day per decade (1981–2025), but we cannot rule out chance (p = 0.38). A longer period or a different region might reveal a clear trend." Nunca usa la palabra "significant".

## Validación

Tests con series sintéticas (`src/analysis/tests/test_trend.py`, semillas fijas): recupera una pendiente conocida con ciclo estacional; tasa de falsos positivos sin tendencia ≤ 10 % (40 semillas); contraste AR(1) φ = 0.9 entre Mann–Kendall original y Hamed–Rao; robustez a outliers frente a mínimos cuadrados; faltantes; datos insuficientes; redacción del veredicto; tendencia decreciente.

## Mapas de tendencia (pipeline, #22)

`uv run python -m pipeline trend-maps` (`src/pipeline/pipeline/trend_maps.py`), con `ESTD_CACHE_DIR` para no volver a descargar.

1. Dominio 60°S–70°N, todas las longitudes, en teselas de 10° × 10° de NASA POWER (468 por variable, ~2 GB en total).
2. Cada tesela se divide en celdas de **2.5°**; los puntos de rejilla se asignan con límites semiabiertos (un punto en el borde pertenece a una sola tesela) y se promedian con peso cos(latitud).
3. Cada celda pasa por el mismo `compute_trend` que la API (anomalías, Theil–Sen, Mann–Kendall Hamed–Rao). Celdas con < 24 meses de dato se omiten.
4. **Comparaciones múltiples**: con miles de celdas, ~5 % saldrían "significativas" por azar. Se aplica **Benjamini–Hochberg** (FDR 5 %) sobre todas las celdas del mapa; `significant` en el GeoJSON es el resultado tras FDR y `p_value` es el valor sin ajustar.
5. Leyenda simétrica alrededor de 0 (percentil 98 de |pendiente|); paleta por variable (`RdBu` temperatura, `BrBG` agua).

Decisión documentada en [`decisions/2026-11-14-trend-method.md`](decisions/2026-11-14-trend-method.md).

## Comunicación al usuario

- "Significativo" = es poco probable (p < 0.05) que la tendencia se deba al azar.
- Tendencia no significativa ≠ sin cambio: puede requerir un periodo más largo.

## Fuera de alcance

Tendencias no lineales, puntos de quiebre, descomposición STL avanzada (posibles extensiones).

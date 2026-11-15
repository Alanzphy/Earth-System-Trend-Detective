# Producto

## Usuarios

- **Primario**: estudiantes de secundaria y universidad.
- **Secundario**: público general con base científica, docentes.

## Flujo principal (MVP)

1. **Preguntas guiadas**: ¿Qué te interesa? (temperatura, agua, hielo, vegetación, aire…) ¿Dónde? (mapa / tipo de región).
2. **Sugerencia de variables** con definición simple (ver `glossary.md`).
3. **Selección de región y periodo**.
4. **Visualización**: serie temporal cruda, serie desestacionalizada, línea de tendencia.
5. **Veredicto**: dirección, magnitud (unidades/década), significancia (p-valor) explicada en lenguaje simple.
6. **Comparar regiones**: misma variable, tendencias opuestas.
7. **Mapa de tendencias**: vista precalculada de "¿dónde está cambiando?" con píxeles significativos y atenuados.

## Demos obligatorias

Ambas validadas con datos reales de NASA POWER (1981-01 → 2025-12, anomalías mensuales, Theil–Sen + Mann–Kendall con corrección Hamed–Rao, α = 0.05). Valores de la prueba del 2026-11-14; el pipeline (#22) los recalcula.

### Demo 1: calentamiento de la península ibérica

- **Variable**: `temperature_2m` (temperatura del aire a 2 m).
- **Fuente**: NASA POWER (`T2M`).
- **Región**: península ibérica, bbox `[-10, 36, 3, 44]` (357 puntos de rejilla).
- **Periodo**: 1981-01 a 2025-12, mensual.
- **Resultado**: **+0.26 °C/década, p < 0.001** → aumento significativo.
- **Mensaje**: "Near-surface air temperature here rose about 0.26 °C per decade since 1981."

### Demo 2: misma variable, direcciones opuestas

- **Variable**: `precipitation`, **misma fuente para ambas regiones**: NASA POWER (`PRECTOTCORR`).
- **Región A**: Sahel occidental, bbox `[-17, 12, -2, 18]` → **+0.028 mm/día/década, p = 0.036** (más lluvia; recuperación del Sahel tras las sequías de los 70–80).
- **Región B**: Chile central, bbox `[-73, -38, -70, -30]` → **−0.111 mm/día/década, p < 0.001** (menos lluvia; "megasequía" chilena).
- **Periodo**: 1981-01 a 2025-12, mensual.
- **Mensaje**: "The same variable can rise in one region and fall in another."

Descartados en la validación por no ser significativos: Mediterráneo occidental (p = 0.83), Sahel completo `[-15, 12, 30, 18]` (p = 0.32).

## Catálogo de variables (MVP, todas de NASA POWER)

| ID | Variable | Unidad | Definición simple |
|---|---|---|---|
| `temperature_2m` | Temperatura del aire a 2 m | °C | Qué tan cálido o frío está el aire cerca del suelo. |
| `precipitation` | Precipitación | mm/día | Agua que cae como lluvia o nieve. |
| `relative_humidity_2m` | Humedad relativa a 2 m | % | Cuánto vapor de agua contiene el aire respecto a su máximo. |
| `specific_humidity_2m` | Humedad específica a 2 m | g/kg | Gramos de vapor de agua por kilo de aire. |
| `wind_speed_10m` | Velocidad del viento a 10 m | m/s | Qué tan rápido se mueve el aire cerca de la superficie. |
| `solar_radiation` | Radiación solar en superficie | kWh/m²/día | Energía del Sol que llega a la superficie (desde 1984). |
| `evapotranspiration` | Evapotranspiración | mm/día | Agua que pasa del suelo y las plantas al aire como vapor. |
| `soil_wetness_root` | Humedad del suelo (raíces) | fracción 0–1 | Qué tan húmedo está el suelo donde están las raíces (0 = seco, 1 = saturado). |

Parámetros y conversiones de unidades en `data-sources.md`. SST, aerosoles y NDVI (Giovanni) quedan fuera del MVP.

## Regiones de ejemplo

NASA POWER exige bboxes de al menos 2° × 2°; regiones mayores de 10° se piden en teselas.

| Tipo / uso | Región | Bbox `[minLon, minLat, maxLon, maxLat]` |
|---|---|---|
| Desierto | Sahara occidental | `[-15, 15, 5, 30]` |
| Selva | Amazonía central | `[-70, -10, -55, 0]` |
| Estuario | Río de la Plata | `[-59, -36, -55, -33]` |
| Ciudad | Madrid y alrededores | `[-4.75, 39.4, -2.75, 41.4]` |
| Demo 1 | Península ibérica | `[-10, 36, 3, 44]` |
| Demo 2A | Sahel occidental | `[-17, 12, -2, 18]` |
| Demo 2B | Chile central | `[-73, -38, -70, -30]` |

## Fuera de alcance (MVP)

- Análisis de tendencias complejos (no lineales avanzados, cambios de régimen).
- Datos horarios / 3-horarios.

## Opcional

- Asistente IA que sugiere variables según región o noticias.

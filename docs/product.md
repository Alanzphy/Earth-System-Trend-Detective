# Producto

## Usuarios

- **Primario**: estudiantes de secundaria y preparatoria (12–18 años) de escuelas públicas de Chihuahua, desde el teléfono. Ver `PRODUCT.md`.
- **Secundario**: docentes, jueces locales del hackathon y público general.

## Flujo principal (MVP, implementado en la UI)

Una sola vista en inglés, organizada alrededor de la pregunta **"Is your town changing?"** (detalle visual en `DESIGN.md`):

1. **Elegir lugar**: selector con 8 zonas de Chihuahua de 2° × 2° (Cuauhtémoc, Delicias, Chihuahua, Ciudad Juárez, Parral, Nuevo Casas Grandes, Jiménez, Ojinaga), el estado completo y 4 regiones del mundo, más atajos de Chihuahua. Las zonas están **precalculadas** (`public/regions/`, `uv run python -m pipeline regions`): cargan al instante y funcionan con el backend dormido. "Somewhere else" abre coordenadas o dibujo en mapa y ejecuta `POST /trend` en vivo para las 8 variables.
2. **Tarjeta del caso**: nombre del lugar, franjas anuales de temperatura, la cifra principal de la variable enfocada en lenguaje simple (p. ej. "+2.4 °C warmer since 1981", "−118 mm less rain per year"), su veredicto con p-valor y la cuadrícula **"What changed here"** con las 8 variables. Una variable no significativa se muestra como "No clear trend". Cada celda enfoca su variable.
3. **"How we know it's real"**: veredicto de la API, gráfico de anomalías con tendencia (serie cruda opcional en eje propio), cambio por década, IC 95 %, p-valor, meses y método bajo "How we measured it". No es un pronóstico ni consejo agrícola.
4. **Guardar la tarjeta**: imagen 4:5 generada en el dispositivo (sin subir datos) con alias o nombre de pila y escuela/club opcionales; usa compartir nativo si existe, si no descarga.
5. **Comparar**: un segundo lugar precalculado; dos tarjetas y dos evidencias con la misma escala de anomalías.
6. **Mapa mundial** (`public/trend-maps/`): temperatura y lluvia, celdas no significativas en gris, selector de teclado con las 20 celdas de mayor cambio. "Analyze this region" convierte la celda en un área personalizada analizada en vivo.
7. **Casos reales** ("Same variable, opposite directions") y **método** en tres pasos.

El estado vive en la URL: `?place=<id>` o `?bbox=minLon,minLat,maxLon,maxLat`, más `compare=<id>` y `var=<variable>`. Un enlace restaura el caso completo.

## Casos (ejemplos de demostración del reto)

Sección "Cases from Chihuahua" de la UI. Cifras de `public/regions/summary.json` (NASA POWER 1981-01 → 2025-12, anomalías mensuales, Theil–Sen + Mann–Kendall con corrección Hamed–Rao, α = 0.05), generadas por `uv run python -m pipeline regions`; ningún número está escrito a mano. Cada caso abre la investigación con su lugar, variable y comparación. Decisión: [`decisions/2026-11-15-chihuahua-cases.md`](decisions/2026-11-15-chihuahua-cases.md).

| Caso | Lugar / variable | Resultado |
|---|---|---|
| **Delicias is heating up** | Delicias, temperatura | +2.4 °C desde 1981, p < 0.001 |
| **Less rain, drier soil in Cuauhtémoc** | Cuauhtémoc, lluvia y humedad del suelo | −167 mm/año (−34 %), p = 0.010; suelo −11 %, p = 0.044 |
| **Not one town: all of Chihuahua** | 8 zonas, temperatura y lluvia | +2.0 a +2.4 °C y −28 % a −39 % de lluvia, todas significativas |
| **Same rain, opposite directions** | Estado de Chihuahua vs Sahel occidental, lluvia | −143 mm/año (−32 %) vs +45 mm/año (+8 %): la misma variable cambia en sentidos opuestos |

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

## Lugares precalculados

NASA POWER exige bboxes de al menos 2° × 2°; regiones mayores de 10° se piden en teselas. Definidos en `src/pipeline/pipeline/regions.py`.

| Grupo | Lugares |
|---|---|
| Chihuahua (2° × 2° alrededor de cada ciudad) | Cuauhtémoc, Delicias, Chihuahua, Ciudad Juárez, Hidalgo del Parral, Nuevo Casas Grandes, Jiménez, Ojinaga |
| Chihuahua (estado) | `[-109, 25.5, -103.3, 31.8]` |
| Around the world | Península ibérica `[-10, 36, 3, 44]`, Sahel occidental `[-17, 12, -2, 18]`, Chile central `[-73, -38, -70, -30]`, Amazonía central `[-70, -10, -55, 0]` |

Cualquier otro lugar se analiza en vivo con coordenadas o dibujando un rectángulo.

## Fuera de alcance (MVP)

- Análisis de tendencias complejos (no lineales avanzados, cambios de régimen).
- Datos horarios / 3-horarios.

## Opcional

- Asistente IA que sugiere variables según región o noticias.

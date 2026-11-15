# Producto

## Usuarios

- **Primario**: estudiantes de secundaria y universidad.
- **Secundario**: público general con base científica, docentes.

## Flujo principal (MVP, implementado en la UI)

La página es una sola vista en inglés, en este orden:

1. **Cabecera**: qué hace la herramienta en una línea y el aviso "We describe past change; this is not a forecast.". Indicador de estado de la API.
2. **Demos** ("Start with a demo"): galería leída de `src/ui/public/demos/manifest.json`. Al abrir una demo se muestran sus paneles con el mismo gráfico y veredicto que el análisis en vivo; las demos de dos paneles se ven lado a lado. Son archivos estáticos: funcionan con el backend dormido.
3. **Mapa de tendencias** ("Where is it changing?"): mapa precalculado (`public/trend-maps/`) con celdas significativas coloreadas y no significativas atenuadas en gris. Paleta divergente centrada en 0: `RdBu` (azul = baja, rojo = sube) para variables tipo temperatura y `BrBG` (marrón = más seco, verde azulado = más húmedo) para variables de agua. Si hay varios mapas, botones para cambiar. Al hacer clic en una celda, "Analyze this region" rellena el flujo guiado con variable, bbox y periodo y lanza el análisis.
4. **Flujo guiado** ("Explore a region"):
   1. **Tema**: Temperature, Water, Air, Energy, Soil; filtra el catálogo (`GET /variables`) por `category`.
   2. **Variable**: nombre, unidades, definición simple, fuente y disponibilidad.
   3. **Región**: atajos con las regiones de ejemplo (abajo), dibujo de un rectángulo con dos clics en el mapa o coordenadas escritas (alternativa con teclado). Aviso si la caja es menor de 2° × 2°; error si supera 40° × 40° (límite de la API). "Compare with another region" añade una región B.
   4. **Periodo**: mes inicial y final dentro de la disponibilidad de la variable (por defecto 1981-01 a 2025-12); resolución mensual.

   El estado se refleja en la URL (`variable`, `bbox`, `start`, `end`, `compare`); un enlace con variable y región lanza el análisis al cargar.
5. **Resultados**: `POST /trend` por región (dos en paralelo al comparar, lado a lado). Mientras carga: "Preparing NASA data…", y tras 5 s "Waking up the server…". Los errores `ErrorResponse` se muestran con su mensaje y código.
   - **Gráfico** (Plotly, carga diferida): arriba la serie mensual cruda; abajo las anomalías (sin ciclo estacional) con la línea de tendencia, solo sobre los meses analizados (nunca se extrapola).
   - **Veredicto**: flecha y palabra (Increasing / Decreasing / No clear trend), insignia de significancia con icono y texto (no solo color), pendiente por década con unidades e IC 95 %, cambio total en el periodo, p-valor, α, método, periodo, región y n. Solo se dice "statistically significant" si `significant` es verdadero y p < α. Texto en lenguaje simple de la API (`verdict`).
   - Cada término técnico (anomalía, tendencia, ciclo estacional, p-valor, intervalo de confianza, significancia, Theil–Sen, Mann–Kendall) abre su definición de `glossary.md` en un globo accesible.

## Demos obligatorias

Ambas validadas con datos reales de NASA POWER (1981-01 → 2025-12, anomalías mensuales, Theil–Sen + Mann–Kendall con corrección Hamed–Rao, α = 0.05). Valores generados por el pipeline (`uv run python -m pipeline demos`, Hamed–Rao con 12 rezagos); los archivos están en `src/ui/public/demos/`.

### Demo 1: calentamiento de la península ibérica

- **Variable**: `temperature_2m` (temperatura del aire a 2 m).
- **Fuente**: NASA POWER (`T2M`).
- **Región**: península ibérica, bbox `[-10, 36, 3, 44]` (357 puntos de rejilla).
- **Periodo**: 1981-01 a 2025-12, mensual.
- **Resultado**: **+0.26 °C/década, p < 0.001** → aumento significativo.
- **Mensaje**: "Near-surface air temperature here rose about 0.26 °C per decade since 1981."

### Demo 2: misma variable, direcciones opuestas

- **Variable**: `precipitation`, **misma fuente para ambas regiones**: NASA POWER (`PRECTOTCORR`).
- **Región A**: Sahel occidental, bbox `[-17, 12, -2, 18]` → **+0.028 mm/día/década, p = 0.0035** (más lluvia; recuperación del Sahel tras las sequías de los 70–80).
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

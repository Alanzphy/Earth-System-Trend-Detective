# Producto

## Usuarios

- **Primario**: estudiantes de secundaria y universidad.
- **Secundario**: público general con base científica, docentes.

## Flujo principal (MVP, implementado en la UI)

La página es una herramienta de exploración en inglés, no una portada seguida de formularios:

1. **Introducción**: la pregunta «What is changing on Earth?» y acceso directo a un ejemplo real.
2. **Espacio de investigación**:
   - En escritorio, el constructor y un único mapa comparten la pantalla. En móvil se apilan.
   - **Qué**: filtro opcional por tema y selector de variable con su definición simple.
   - **Dónde**: selector de regiones; dibujo y coordenadas se muestran bajo demanda. Comparar abre un selector B vacío: nunca se elige una región por el usuario.
   - **Cuándo**: meses de inicio y fin, ajustados a la disponibilidad real de cada variable.
   - **Mapa**: temperatura y precipitación precalculadas (`public/trend-maps/`), escala divergente centrada en cero y celdas no significativas grises. Nombres, fronteras y costas conservan la referencia geográfica. No se repite el mundo ni se permite inclinarlo. Un selector ofrece las 20 celdas significativas de mayor cambio absoluto como alternativa de teclado, identificadas explícitamente como extremos, no como muestra representativa.
   - Clic o selección de una celda → evidencia local → «Analyze this region» configura y ejecuta su análisis.
   - Paletas: `RdBu` (azul baja / rojo sube) para temperatura; `BrBG` (marrón disminuye / verde azulado aumenta) para agua.
3. **Resultados**: conclusión y cambio por década primero; gráfico de anomalías al lado en escritorio, debajo en móvil. Al comparar, ambos gráficos comparten exactamente el mismo rango de anomalías. La serie mensual cruda es opcional y usa un eje separado, nunca el mismo que las anomalías.
   - Solo se afirma significancia si p < α. Se conservan pendiente, IC 95 %, cambio total, región, periodo y p-valor.
   - Método, α, n, puntos de rejilla y glosario están bajo «How we measured it». No se extrapola al futuro.
   - `POST /trend` se ejecuta por región; carga y errores son explícitos. El foco pasa al resultado cuando existe en el DOM.
4. **Casos reales**: dos ejemplos con cifras, p-valores y gráficos calculados desde los JSON del pipeline; no números escritos a mano. Abrirlos muestra la misma evidencia que un análisis en vivo. Se pueden cerrar y funcionan sin API.
5. **Cómo leer la evidencia**: explicación breve de colores, estacionalidad y significancia; aviso visible de que no es un pronóstico.

El estado del constructor se refleja en la URL (`variable`, `bbox`, `start`, `end`, `compare`). Un enlace completo restaura y ejecuta la investigación. Los resultados no ocupan espacio hasta que se solicita un análisis. Las áreas personalizadas siguen admitiendo coordenadas decimales; no se restringen a múltiplos de 0,25°.

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

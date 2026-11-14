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

### Demo 1: calentamiento de la península ibérica

- **Variable**: `temperature_2m` (temperatura del aire a 2 m).
- **Fuente**: NASA POWER.
- **Región**: península ibérica, bbox `[-10, 36, 3, 44]`.
- **Periodo**: 1981-01 a 2024-12, resolución mensual.
- **Resultado esperado**: tendencia positiva y significativa, en °C/década.
- **Mensaje para el usuario**: "La temperatura del aire cerca del suelo ha aumentado X °C por década en esta región".

### Demo 2: lluvia con tendencias opuestas

- **Variable**: `precipitation` (precipitación total).
- **Fuente**: NASA POWER y Giovanni.
- **Región A**: Sahel, bbox `[-15, 12, 30, 18]`; se espera tendencia positiva.
- **Región B**: Mediterráneo occidental, bbox `[-5, 30, 10, 45]`; se espera tendencia negativa.
- **Periodo**: 1981-01 a 2024-12, resolución mensual.
- **Resultado esperado**: misma variable, signos opuestos y significancia estadística.
- **Mensaje para el usuario**: "Una misma variable puede subir en una región y bajar en otra; el mapa ayuda a verlo de un vistazo".

> Las demos dependen de la validación de disponibilidad y cobertura de #3. Si una región no tiene datos suficientes, se sustituye por otra del catálogo sin cambiar el objetivo didáctico.

## Catálogo inicial de variables

| ID | Variable | Unidad | Definición simple | Fuente prevista | Resolución |
|---|---|---|---|---|---|
| `temperature_2m` | Temperatura del aire a 2 m | °C | Qué tan cálido o frío está el aire cerca del suelo. | NASA POWER | diaria/mensual |
| `precipitation` | Precipitación | mm/día | Agua que cae como lluvia o nieve. | NASA POWER / Giovanni | diaria/mensual |
| `relative_humidity_2m` | Humedad relativa a 2 m | % | Cuánto vapor de agua contiene el aire respecto a su máximo. | NASA POWER | diaria/mensual |
| `wind_speed_10m` | Velocidad del viento a 10 m | m/s | Qué tan rápido se mueve el aire cerca de la superficie. | NASA POWER | diaria/mensual |
| `solar_radiation` | Radiación solar en superficie | kWh/m²/día | Energía del Sol que llega a la superficie. | NASA POWER | diaria/mensual |
| `evaporation` | Evaporación | mm/día | Agua que pasa de la superficie al aire como vapor. | NASA POWER / Giovanni | mensual |
| `soil_moisture` | Humedad del suelo | m³/m³ | Agua almacenada en el suelo. | NASA POWER / GLDAS | mensual |
| `sea_surface_temperature` | Temperatura superficial del mar | °C | Temperatura de la capa superior del océano. | Giovanni | mensual |
| `aerosol_optical_depth` | Profundidad óptica de aerosoles | adimensional | Cantidad de partículas diminutas suspendidas en el aire. | Giovanni | mensual |
| `ndvi` | Índice de vegetación (NDVI) | adimensional | Qué tan verde y saludable se ve la vegetación. | Giovanni | mensual |

Las definiciones de esta tabla se incorporan al glosario de la UI (`glossary.md`) con su versión en inglés.

## Regiones de ejemplo

| Tipo / uso | Región | Bbox `[minLon, minLat, maxLon, maxLat]` | Notas |
|---|---|---|---|
| Desierto | Sahara occidental | `[-15, 15, 5, 30]` | Contraste seco para precipitación y aerosoles. |
| Selva | Amazonía | `[-75, -15, -45, 5]` | Vegetación, precipitación y evaporación. |
| Estuario | Río de la Plata | `[-59, -36, -53, -34]` | Agua, sedimentos y presión urbana. |
| Ciudad | Madrid | `[-4.5, 40.0, -3.0, 41.0]` | Temperatura urbana y aerosoles. |
| Demo 1 | Península ibérica | `[-10, 36, 3, 44]` | Calentamiento del aire. |
| Demo 2A | Sahel | `[-15, 12, 30, 18]` | Lluvia con tendencia positiva. |
| Demo 2B | Mediterráneo occidental | `[-5, 30, 10, 45]` | Lluvia con tendencia negativa. |

## Fuera de alcance (MVP)

- Análisis de tendencias complejos (no lineales avanzados, cambios de régimen).
- Datos horarios / 3-horarios.

## Opcional

- Asistente IA que sugiere variables según región o noticias.

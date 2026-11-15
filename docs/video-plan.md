# Plan de producción: video de 30 s y capturas del pitch

> Documento autocontenido para quien produzca el material (una persona o Claude en la app de escritorio). No hace falta otro contexto: aquí está qué es el proyecto, qué mensaje transmitir, qué grabar escena por escena, qué debe verse en pantalla y cómo exportarlo.

## 1. Qué es el proyecto (contexto mínimo)

- **Earth System Trend Detective**, NASA Space Apps Challenge 2026, reto *"Be An Earth System Trend Detective"*: herramienta para que estudiantes elijan variables del sistema Tierra y descubran **qué cambia, dónde, cuánto y si el cambio es significativo**.
- **Para quién**: jóvenes de 12–18 años de escuelas públicas de Chihuahua (México), desde el teléfono. El equipo da talleres en escuelas públicas.
- **Idea central**: *de consumir a investigar*. El teléfono se vuelve un instrumento científico: el estudiante elige su lugar, lee 45 años de datos de NASA y se lleva una **tarjeta de caso** con su hallazgo, que puede compartir.
- **Dato gancho (real, calculado con la app)**: en Delicias, Chihuahua, la temperatura subió **+2.4 °C desde 1981** (p < 0.001) y llueve **~118 mm menos al año**. El estado de Chihuahua se calienta **unas 2.5 veces** más rápido que el promedio del mapa mundial de la app.
- **Tono**: curiosidad de detective, asombro, rigor científico. **Nunca** alarmista, infantil ni de "dashboard corporativo". La herramienta describe el pasado: **no es un pronóstico** ni un consejo agrícola.

## 2. Entregables

| # | Entregable | Formato |
|---|---|---|
| A | **Video de la entrega** | MP4 H.264, 1920 × 1080, **≤ 30 s exactos**, sin audio o con música libre de derechos, **subtítulos en inglés** incrustados |
| B | **Video para el pitch** | El mismo video **sin subtítulos** (se narra en vivo en español), mismo formato |
| C | **Capturas para las diapositivas** | PNG 1920 × 1080 (escritorio) y 1170 × 2532 o similar (teléfono), listadas en la sección 6 |
| D | **Imagen de tarjeta de caso** | El PNG que genera la propia app (botón *Save my case card*) |

## 3. Reglas obligatorias (requisitos de Space Apps y del proyecto)

1. Todo en **inglés** en el video de la entrega (subtítulos y pantalla). El pitch en vivo es en español.
2. **Sin logos, banderas ni identificadores de misión de NASA** en nada que agreguemos (la app ya cumple).
3. **Nada generado por IA** en imagen, video o voz (si lo hubiera, exigiría marca de agua visible). Solo grabación real de la app y texto.
4. **Solo cifras que se vean en la app.** Si una cifra en pantalla no coincide con este plan, se usa la de la pantalla y se ajusta el subtítulo; nunca al revés.
5. **Privacidad**: en la tarjeta se escribe un alias o nombre de pila de ejemplo (p. ej. `Ana`), nunca nombres completos ni datos reales de menores.
6. Duración final **≤ 30 s**. Si se pasa, se recorta, no se acelera el texto.

## 4. Preparación

- **URL**: `https://earth-system-trend-detective-xi.vercel.app`. Antes de grabar, confirmar que muestra el diseño nuevo: banda azul noche con el título **"Is your town changing?"** y un selector de lugar. Si muestra el diseño anterior, avisar al equipo: falta publicar.
- **Navegador**: Chrome o Safari, ventana de **1600 × 900** o pantalla completa 16:9, zoom 100 %, sin barra de marcadores ni extensiones visibles, modo claro del sistema.
- **Precarga** (para que nada aparezca cargando en el video): abrir `https://earth-system-trend-detective-xi.vercel.app/?place=delicias&var=temperature_2m`, bajar hasta **"Where is it changing fastest?"**, esperar ~10 s a que el mapa muestre colores, y volver arriba. Las zonas de Chihuahua están precalculadas: no dependen del servidor.
- **Grabación** (macOS): `Cmd + Shift + 5` → *Grabar la parte seleccionada* sobre la ventana del navegador, o QuickTime → *Nueva grabación de pantalla*. Grabar cada escena por separado o todo seguido (40–60 s) y recortar después.
- **Cursor**: movimientos lentos y directos; pausa de ~1 s sobre cada cifra antes de hacer clic.

## 5. Escenas del video (30 s)

Las cifras entre comillas deben **verse en pantalla**; son la comprobación de cada escena.

| # | Tiempo | Dónde / qué hacer | Debe verse | Subtítulo (inglés) |
|---|---|---|---|---|
| 1 | 0:00–0:05 | Abrir `/?place=delicias&var=temperature_2m` arriba del todo. Quieto. | Banda azul noche, **"Is your town changing?"**, selector con *Delicias area, Chihuahua*, atajos (Cuauhtémoc, Delicias…) | **NASA Earth data. Your town. 45 years.** |
| 2 | 0:05–0:11 | Bajar suavemente hasta ver la tarjeta completa. Quieto sobre la cifra. | Tarjeta *Delicias area, Chihuahua*, franjas azul→rojo 1981–2025, **"+2.4 °C" "warmer since 1981"**, insignia **"Statistically significant … p < 0.001"** | **Delicias, Chihuahua: +2.4 °C since 1981. Not chance.** |
| 3 | 0:11–0:16 | En *What changed here*, clic en **Rain**; 2 s; clic en **Soil moisture**. | La cifra grande cambia a **"−118 mm"** *less rain per year*, luego a la humedad del suelo; la cuadrícula muestra las 8 variables (una dice **"No clear trend"**) | **Less rain. Drier soil. Eight variables at once.** |
| 4 | 0:16–0:21 | Clic otra vez en **Heat**. En *How we know it's real*, clic en **Raw monthly values**; 2 s; clic en **Without seasons**. | Vista cruda: ondas de verano/invierno; vista sin estaciones: línea naranja de tendencia subiendo | **Remove the seasons. Then test the trend.** |
| 5 | 0:21–0:26 | Bajar a **"Where is it changing fastest?"**. Quieto sobre el mapa. | Mapa nocturno con celdas rojas; Chihuahua visible; texto *"warms about 2.5 times the average of this map"* | **Chihuahua warms 2.5× the map's average.** |
| 6 | 0:26–0:30 | Volver a la tarjeta, clic **Save my case card**, escribir `Ana` y `Secundaria 12`, clic **Save image**. Cerrar con la imagen descargada abierta a pantalla completa (Vista Previa), o un fundido a ella. | La imagen de la tarjeta con *Investigated by Ana · Secundaria 12* | **Students become climate detectives.** + URL `earth-system-trend-detective-xi.vercel.app` |

**Si sobra tiempo o se quiere una alternativa a la escena 5**: abrir `/?place=western-sahel&compare=central-chile&var=precipitation` → dos tarjetas: Sahel **"+45 mm"** (más lluvia) y Chile central **"−182 mm"** (menos lluvia). Subtítulo: **Same rain, opposite directions.** Es el corazón del reto (una variable puede subir en un lugar y bajar en otro).

### Subtítulos: estilo

Texto blanco sobre una franja oscura semitransparente en la parte inferior, centrado, fuente sans (Archivo, Helvetica o SF), ~44 px en 1080p, máximo 2 líneas, visible al menos 2.5 s. Herramientas: iMovie (Títulos → *Tercio inferior*), CapCut o Clipchamp. La URL de la escena 6 puede quedar fija los últimos 4 s.

## 6. Capturas para las diapositivas del pitch (4 min, 7 diapositivas)

| Diapositiva | Captura | URL / acción |
|---|---|---|
| 1 · Gancho | Mapa mundial con Chihuahua en rojo | `/?place=chihuahua-state&var=temperature_2m` → sección *Where is it changing fastest?* |
| 2 · Problema | Tarjeta de Delicias en **teléfono** (vista vertical) | Modo dispositivo del navegador (iPhone) o un teléfono real, `/?place=delicias&var=temperature_2m` |
| 3 · Demo | Video **B** (sin subtítulos) incrustado en la diapositiva, en silencio, como archivo local | — |
| 4 · Por qué es confiable | Panel *How we know it's real* en vista *Without seasons*, y otra en *Raw monthly values* | Mismo enlace de Delicias |
| 5 · De consumir a investigar | La imagen de la tarjeta (entregable D) junto a un teléfono | Botón *Save my case card* |
| 6 · Quién lo hace posible | Sin captura de la app (texto: talleres en escuelas públicas, UACH, Zootecnia, formato tipo Las Niñas Sí Pueden) | — |
| 7 · Siguientes pasos | Comparación Sahel vs Chile central | `/?place=western-sahel&compare=central-chile&var=precipitation` |

## 7. Qué no decir ni mostrar

- No afirmar que ya hay un piloto, escuelas aliadas o resultados con estudiantes: es el **siguiente paso**.
- No presentar la tendencia como pronóstico ("va a hacer", "en 2050…").
- No usar las cifras de Iberia como "el ejemplo principal": el foco es Chihuahua.
- No mostrar la evapotranspiración como dato estelar (se corrigió su fuente recientemente; usar temperatura, lluvia y humedad del suelo).

## 8. Comprobación final antes de entregar

- [ ] Dura ≤ 30 s (comprobar en el reproductor).
- [ ] 1920 × 1080, MP4 H.264, se reproduce sin internet.
- [ ] Cada cifra del subtítulo coincide con la pantalla en ese momento.
- [ ] Ningún logo de NASA, ninguna imagen o voz generada por IA.
- [ ] La URL final es la de producción y abre el diseño nuevo.
- [ ] Versión B (sin subtítulos) exportada para la diapositiva 3.

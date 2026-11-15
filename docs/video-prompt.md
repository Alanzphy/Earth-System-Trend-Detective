# Prompt para Claude: video del pitch con Remotion

> **Cómo usarlo:** abre Claude (app de escritorio) y adjunta `docs/video-plan.md`, `docs/video-stripes-chihuahua.json` y las capturas con los nombres de la sección "Archivos". Pega todo el texto que está entre las líneas `---`. Claude escribe un proyecto de **Remotion** (video como código React) y ustedes lo exportan a MP4 con un comando; las instrucciones están al final. Producción completa y reglas: `video-plan.md`.

---

Eres diseñador de motion graphics y desarrollador de **Remotion** (v4, TypeScript). Vas a crear el video que se proyecta **detrás de un equipo mientras da un pitch en vivo de 4 minutos en español** en NASA Space Apps Challenge 2026, Chihuahua, México.

El proyecto es **Earth System Trend Detective**: una app web en la que estudiantes de 12 a 18 años eligen su lugar, apuestan qué cambió y descubren, con 45 años de datos de NASA, qué cambió, cuánto y si es real. Idea central: **"de consumir a investigar"**, el teléfono como instrumento científico.

Adjunto `video-plan.md` (lee las secciones 4 y 7), `video-stripes-chihuahua.json` (las franjas reales) y las capturas reales de la app. **El equipo habla y tu animación acompaña**: poco texto, grande, una idea por momento.

## Qué entregas

Un proyecto de Remotion completo y listo para `npm install` y `npx remotion render`. Escribe **todos los archivos completos**, sin "..." ni partes por rellenar:

```
package.json            remotion, @remotion/cli, @remotion/google-fonts, react, react-dom, typescript
remotion.config.ts
src/index.ts            registerRoot
src/Root.tsx            todas las composiciones
src/theme.ts            colores, tipografías, tamaños
src/components/         Watermark, Stripes, CountUp, Title, Frame (marco de dispositivo)
src/clips/Clip1Gancho.tsx … Clip7Cierre.tsx
src/Entrega30s.tsx      (opcional, ver abajo)
public/                 aquí van las capturas y el JSON (los pone el equipo)
```

**Composiciones** (todas a 1920 × 1080 y 30 fps):

| id | Duración | Uso |
|---|---|---|
| `Clip1Gancho` | 25 s = 750 cuadros | Diapositiva 1 |
| `Clip2Problema` | 30 s = 900 | Diapositiva 2 |
| `Clip3Herramienta` | 45 s = 1350 | Diapositiva 3 |
| `Clip4Confiable` | 35 s = 1050 | Diapositiva 4 |
| `Clip5Investigar` | 40 s = 1200 | Diapositiva 5 |
| `Clip6Quien` | 35 s = 1050 | Diapositiva 6 |
| `Clip7Cierre` | 30 s = 900 | Diapositiva 7 |
| `PitchCompleto` | 240 s = 7200 | Los 7 clips seguidos con `<Series>` |
| `Entrega30s` | 30 s = 900 | Opcional: video de entrega en inglés |

**Requisitos técnicos:**

- Anima solo con `useCurrentFrame`, `interpolate` (con `extrapolateLeft/Right: "clamp"`), `spring` y `Easing`. **Nada de animaciones CSS ni `setTimeout`**: Remotion renderiza cuadro por cuadro.
- Imágenes con `<Img src={staticFile("C2.png")} />`, video con `<OffthreadVideo src={staticFile("R2.mp4")} muted />` y datos con `staticFile("video-stripes-chihuahua.json")`, cargados con `delayRender`/`continueRender`, o importando el JSON directamente.
- Fuentes con `@remotion/google-fonts/Archivo` y `@remotion/google-fonts/JetBrainsMono`.
- **Bucles perfectos**: cada clip 1–7 se reproduce en bucle en la presentación. En los últimos 20 cuadros, vuelve al estado visual exacto del cuadro 0, para que el corte no se note.
- Componente `<Watermark>` en **todas** las composiciones, visible todo el tiempo: esquina inferior derecha, 18 px, opacidad 0.7, color `#f4f6ff`. Texto: **"Animación hecha con asistencia de IA (Claude)"**; en `Entrega30s`, **"Motion graphics made with AI assistance (Claude)"**.
- Sin audio.
- Antes de escribir código, lista qué archivos de `public/` usará cada composición. Si una captura no existe, usa el respaldo indicado en el clip; **nunca dibujes ni inventes pantallas de la app**.

## Archivos (los pone el equipo en `public/`)

| Archivo | Qué muestra |
|---|---|
| `video-stripes-chihuahua.json` | 45 franjas reales del estado de Chihuahua, 1981–2025: `{ year, anomaly, color }`. Usa **estos colores, en este orden** |
| `C2.png` | Tarjeta de Delicias: franjas, **+2.4 °C**, "Statistically significant" |
| `C4.png` | Gráfico de anomalías sin estaciones, con la línea de tendencia naranja |
| `C5.png` | Gráfico de valores mensuales crudos (ondas de verano e invierno) |
| `C7.png` | Tabla de las 8 zonas de Chihuahua con franjas |
| `C10.png` | Mapa mundial nocturno de tendencias, Chihuahua en rojo |
| `C11.png` | La app en un teléfono (vertical) |
| `C12.png` | Pantalla "Before you look", con las 3 preguntas |
| `C13.png` | Resultado "You called 2 of 3 before looking" |
| `D1.png`, `D2.png`, `D3.png` | Tarjetas de caso guardadas (1080 × 1350), con los alias Ana, Luis y Sofi |
| `R1.mp4` | Grabación para el video de entrega (~40 s) |
| `R2.mp4` | Grabación de la demo: apostar, revelar, ¿es real? (~40 s) |

## Sistema visual (obligatorio)

- **Colores**: noche `#0f1a3a`, `#1a2856`, `#24346b`; texto `#f4f6ff`, secundario `#b4bee0`; cifra principal ámbar `#ffb347` o naranja `#ff6a1a`; "verificado" celeste `#9fd7ff`.
- **Tipografía**: **Archivo** (peso 800–900, ancho expandido si la variante lo permite) para cifras y titulares; **JetBrains Mono** solo para datos técnicos (años, p-valor).
- **Legibilidad**: texto de **48 px o más** (se proyecta en un salón), máximo 2 líneas, márgenes de 120 px.
- **Movimiento**: entradas con *ease-out* (`Easing.out(Easing.cubic)`) o `spring` sin rebote (`damping` ≥ 200), de 18 a 27 cuadros. Una idea a la vez. **Prohibido**: rebotes, partículas, giros 3D, brillos, emojis, íconos genéricos o imágenes generadas.
- **Firma visual** (`<Stripes>`): las 45 franjas del JSON se revelan de izquierda a derecha, una por año, con un contador de año en JetBrains Mono. Las cifras (`<CountUp>`) cuentan de 0 a su valor en unos 30 cuadros y se quedan quietas.

## Los 7 clips del pitch

**Clip 1 · Gancho (25 s).** `<Stripes>` ocupa el ancho de la pantalla y se revela de 1981 a 2025 en unos 10 s. Al llegar a 2025, **+2.1 °C** cuenta hacia arriba, en ámbar, con *"Estado de Chihuahua, desde 1981"* debajo. Luego `C10.png` entra con un acercamiento lento (escala de 1.0 a 1.08). Texto: **"Chihuahua está en el 4 % de los lugares del mapa que más rápido se calientan."**

**Clip 2 · El problema (30 s).** Las franjas de fondo al 25 % de opacidad. Frases una por una, unos 6 s cada una: **"Los datos existen: 45 años de NASA."** → **"No llegan a quienes viven de esta tierra."** → **"Los teléfonos se hicieron para consumir."** → **"Ellos van a heredar la tierra y el agua de Chihuahua."** Al final, `C11.png` entra desde abajo.

**Clip 3 · La herramienta (45 s).** `R2.mp4` dentro de `<Frame>`, un marco de teléfono o laptop dibujado con formas simples, sin marcas comerciales. A la izquierda, un título que cambia con la acción: **"Elige tu lugar"** → **"Apuesta"** → **"Revela"** → **"¿Es real?"**. Respaldo si no hay `R2.mp4`: `C12.png` → `C13.png` → `C2.png` → `C4.png` con transiciones suaves.

**Clip 4 · Por qué es confiable (35 s).** `C5.png` se funde en `C4.png`. Aparecen tres pasos numerados, uno por uno: **"1. Quitamos las estaciones"** · **"2. Medimos el cambio"** · **"3. ¿Pudo ser azar? p < 0.001"**. Al final: **"Confirmado con ERA5 (Europa) y estaciones del SMN"** y, más pequeño, *"Descriptivo, no es un pronóstico"*.

**Clip 5 · De consumir a investigar (40 s).** `C13.png` primero. Luego `D1.png`, `D2.png` y `D3.png` entran como cartas en abanico, rotadas −6°, 0° y +6°. Texto: **"Primero la curiosidad, después la evidencia."** → **"Cada estudiante se lleva su caso."**

**Clip 6 · Quién lo hace posible (35 s).** Diagrama de 4 nodos (tarjetas redondeadas) unidos por líneas que se dibujan (SVG con `strokeDashoffset` interpolado): **Jóvenes** (investigan) → **Nosotros** (tecnología y talleres) → **Expertos** (agronomía y zootecnia UACH, estadística) → **Datos de NASA**. Solo texto: **sin logos** de NASA, UACH ni ninguna institución.

**Clip 7 · Cierre (30 s).** `C7.png` aparece fila por fila (máscara de arriba abajo). Texto: **"No es un pueblo: es todo Chihuahua."** → **"Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante puede convertir el suyo en un instrumento científico."** → **"Earth System Trend Detective"** · `earth-system-trend-detective-xi.vercel.app` · *Datos: NASA POWER*. Queda quieto unos 3 s antes del bucle.

## Opcional: `Entrega30s` (video de entrega en inglés, 30 s)

`R1.mp4` a pantalla completa, con subtítulos en inglés en una franja oscura semitransparente abajo (44 px, blanco):

| Tiempo | Subtítulo |
|---|---|
| 0–5 s | NASA Earth data. Your town. 45 years. |
| 5–11 s | Delicias, Chihuahua: +2.4 °C since 1981. Not chance. |
| 11–16 s | Less rain. Drier soil. Eight variables at once. |
| 16–21 s | Remove the seasons. Then test the trend. |
| 21–26 s | Not one town: every zone of Chihuahua. |
| 26–30 s | Students become climate detectives. · earth-system-trend-detective-xi.vercel.app |

Este video **no** hace bucle.

## Reglas que no se pueden romper

1. **Solo estas cifras**, escritas exactamente así: +2.1 °C (estado de Chihuahua), +2.4 °C (Delicias), 4 %, 45 años, 1981, 2025, p < 0.001, +2.0 a +2.4 °C (las 8 zonas), 2 of 3. Las anomalías de las franjas vienen del JSON y no se escriben en pantalla. **Ninguna cifra de lluvia** en los clips 1–7.
2. Nunca escribas "más rápido que el planeta" (el mapa incluye océano): siempre "de los lugares del mapa".
3. Sin logos, banderas ni identificadores de misión de NASA ni de ninguna institución.
4. Sin imágenes, ilustraciones, voces ni música generadas por IA. Solo las capturas, el JSON, formas geométricas y tipografía.
5. La marca de agua de IA aparece en **todas** las composiciones, todo el tiempo.
6. Textos exactamente como están arriba: puedes partir líneas, no reescribirlos.

## Al final

Agrega una nota breve con la duración de cada composición, qué archivos de `public/` usa cada una y cualquier supuesto que hayas tomado.

---

## Después: exportar a MP4 (lo hace el equipo)

Requisitos: Node.js 18 o superior.

1. Crea una carpeta con los archivos que entregó Claude y copia a `public/` las capturas, `video-stripes-chihuahua.json` y las grabaciones. Si una grabación está en `.mov`, conviértela a MP4 con `ffmpeg -i R2.mov -c:v libx264 -pix_fmt yuv420p R2.mp4`.
2. `npm install`
3. Vista previa interactiva: `npx remotion studio`. Revisen cada clip y pidan a Claude los ajustes.
4. Exportar cada clip:

```bash
for c in Clip1Gancho Clip2Problema Clip3Herramienta Clip4Confiable Clip5Investigar Clip6Quien Clip7Cierre PitchCompleto Entrega30s; do
  npx remotion render "$c" "out/$c.mp4" --codec=h264
done
```

5. Revisen en cada MP4 que la marca de agua se vea y que las cifras coincidan con la regla 1.
6. Inserten `Clip1`–`Clip7` en sus diapositivas: reproducción automática, en bucle, sin sonido, como archivo local. `PitchCompleto` es el respaldo si prefieren un solo video, y `Entrega30s` es el video que se sube a Space Apps.

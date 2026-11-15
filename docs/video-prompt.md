# Prompt para Claude: video del pitch y demo de 30 s con Remotion

> **Cómo usarlo:** abre Claude (app de escritorio) y adjunta `docs/video-plan.md`, `docs/video-stripes-chihuahua.json` y las capturas con los nombres de la sección "Archivos". Pega todo el texto que está entre las líneas `---`. Claude escribe un proyecto de **Remotion** (video como código React) y ustedes lo exportan a MP4 con un comando; las instrucciones están al final. **No hay que grabar la pantalla**: todo se arma con capturas.

---

Eres diseñador de motion graphics y desarrollador de **Remotion** (v4, TypeScript). Vas a crear dos cosas para el proyecto **Earth System Trend Detective** de NASA Space Apps Challenge 2026 (Chihuahua, México):

1. **Una demo de 30 s** de la app, armada solo con capturas, en dos variantes: con títulos cortos en español, incrustada en la diapositiva 3 del pitch mientras el equipo la narra, y con subtítulos en inglés, como el video oficial que se sube a Space Apps.
2. **7 clips animados**, uno incrustado en cada diapositiva del pitch en vivo de 4 minutos en español; el clip 3 es la demo.

El proyecto es una app web en la que estudiantes de 12 a 18 años eligen su lugar, predicen qué cambió y descubren, con 45 años de datos de NASA, qué cambió, cuánto y si es real. Idea central: **"de consumir a investigar"**, el teléfono como instrumento científico.

Adjunto `video-plan.md` (lee las secciones 4, 6 y 7), `video-stripes-chihuahua.json` (las franjas reales) y las capturas reales de la app. Poco texto, grande, una idea por momento.

## Qué entregas

Un proyecto de Remotion completo y listo para `npm install` y `npx remotion render`. Escribe **todos los archivos completos**, sin "..." ni partes por rellenar:

```
package.json            remotion, @remotion/cli, @remotion/google-fonts, react, react-dom, typescript
remotion.config.ts
src/index.ts            registerRoot
src/Root.tsx            todas las composiciones
src/theme.ts            colores, tipografías, tamaños
src/taps.ts             coordenadas de los "toques" (las ajusta el equipo)
src/components/         Watermark, Stripes, CountUp, Caption, Tap, KenBurns
src/Demo30s.tsx         la demo, con prop variant: "pitch" | "en"
src/clips/Clip1Gancho.tsx … Clip7Cierre.tsx
public/                 aquí van las capturas y el JSON (los pone el equipo)
```

**Composiciones** (todas a 1920 × 1080 y 30 fps):

| id | Duración | Uso |
|---|---|---|
| `DemoPitch` | 30 s = 900 cuadros | `Demo30s` con `variant="pitch"`: solo títulos cortos en español; el equipo la narra en la diapositiva 3 |
| `DemoEn` | 30 s = 900 | `Demo30s` con `variant="en"`: subtítulos completos en inglés; **el video que se sube a Space Apps** |
| `Clip1Gancho` | 25 s = 750 | Diapositiva 1 |
| `Clip2Problema` | 30 s = 900 | Diapositiva 2 |
| `Clip3Herramienta` | 45 s = 1350 | Diapositiva 3: `DemoPitch` (30 s) y después 15 s quieto en su último cuadro |
| `Clip4Confiable` | 35 s = 1050 | Diapositiva 4 |
| `Clip5Investigar` | 40 s = 1200 | Diapositiva 5 |
| `Clip6Quien` | 35 s = 1050 | Diapositiva 6 |
| `Clip7Cierre` | 30 s = 900 | Diapositiva 7 |
| `PitchCompleto` | 240 s = 7200 | Los 7 clips seguidos con `<Series>` |

**Requisitos técnicos:**

- Anima solo con `useCurrentFrame`, `interpolate` (con `extrapolateLeft/Right: "clamp"`), `spring` y `Easing`. **Nada de animaciones CSS ni `setTimeout`**: Remotion renderiza cuadro por cuadro.
- Imágenes con `<Img src={staticFile("C2.png")} />`. El JSON de franjas puedes importarlo directamente.
- Fuentes con `@remotion/google-fonts/Archivo` y `@remotion/google-fonts/JetBrainsMono`.
- **`<KenBurns>`**: muestra una captura con acercamiento o desplazamiento lento hacia un punto de interés, de escala 1.0 a 1.15 como máximo.
- **`<Tap>`**: un círculo blanco semitransparente (unos 56 px) que aparece, se encoge un poco y se desvanece, como un toque en pantalla. **Sus coordenadas viven en `src/taps.ts`**, en píxeles relativos a cada captura y con un comentario por toque, porque tú no puedes ver dónde está cada botón. Pon valores iniciales razonables; el equipo los ajusta en Remotion Studio.
- **Bucles perfectos** en los clips 1–7: en los últimos 20 cuadros, vuelve al estado visual exacto del cuadro 0. La demo **no** hace bucle.
- Componente `<Watermark>` en **todas** las composiciones, visible todo el tiempo: esquina inferior derecha, 18 px, opacidad 0.7, color `#f4f6ff`. En las de español: **"Animación hecha con asistencia de IA (Claude)"**; en `DemoEn`: **"Motion graphics made with AI assistance (Claude)"**.
- Sin audio.
- Antes de escribir código, lista qué archivos de `public/` usa cada composición. **Nunca dibujes ni inventes pantallas de la app**: si falta una captura, dilo.

## Archivos (los pone el equipo en `public/`)

| Archivo | Qué muestra |
|---|---|
| `video-stripes-chihuahua.json` | 45 franjas reales del estado de Chihuahua, 1981–2025: `{ year, anomaly, color }`. Usa **estos colores, en este orden** |
| `C1.png` | Portada: "Is your town changing?" y el selector de lugar |
| `C2.png` | Tarjeta de Delicias: franjas, **+2.4 °C**, "Statistically significant" |
| `C4.png` | Gráfico de anomalías sin estaciones, con la línea de tendencia naranja |
| `C5.png` | Gráfico de valores mensuales crudos (ondas de verano e invierno) |
| `C7.png` | Tabla de las 8 zonas de Chihuahua con franjas |
| `C10.png` | Mapa mundial nocturno de tendencias, Chihuahua en rojo |
| `C11.png` | La app en un teléfono (vertical) |
| `C12.png` | Pantalla "Before you look", con las 3 preguntas |
| `C13.png` | Resultado "You called 2 of 3 before looking" y debajo +2.4 °C |
| `D1.png`, `D2.png`, `D3.png` | Tarjetas de caso guardadas (1080 × 1350), con los alias Ana, Luis y Sofi |

## Sistema visual (obligatorio)

- **Colores**: noche `#0f1a3a`, `#1a2856`, `#24346b`; texto `#f4f6ff`, secundario `#b4bee0`; cifra principal ámbar `#ffb347` o naranja `#ff6a1a`; "verificado" celeste `#9fd7ff`.
- **Tipografía**: **Archivo** (peso 800–900) para cifras y titulares; **JetBrains Mono** solo para datos técnicos (años, p-valor).
- **Legibilidad**: texto de **48 px o más** en los clips (se proyecta en un salón); subtítulos de la demo de 44 px. Máximo 2 líneas, márgenes de 120 px.
- **Movimiento**: entradas con `Easing.out(Easing.cubic)` o `spring` sin rebote (`damping` ≥ 200), de 18 a 27 cuadros. Una idea a la vez. **Prohibido**: rebotes, partículas, giros 3D, brillos, emojis, íconos genéricos o imágenes generadas.
- **Firma visual** (`<Stripes>`): las 45 franjas del JSON se revelan de izquierda a derecha, una por año, con un contador de año en JetBrains Mono. Las cifras (`<CountUp>`) cuentan de 0 a su valor en unos 30 cuadros y se quedan quietas.

## La demo de 30 s (`Demo30s`)

Capturas a pantalla completa, sobre fondo `#0f1a3a` si no llenan el cuadro, con `<KenBurns>` y fundidos de 12 cuadros entre escenas. El texto depende de la variante:

- **`variant="pitch"`**: el equipo habla encima, así que solo lleva un **título corto en español** por escena, en la esquina superior izquierda (Archivo 800, 56 px), que entra y sale con la escena. Nada de subtítulos largos.
- **`variant="en"`**: subtítulos completos en inglés (`<Caption>`), en una franja oscura semitransparente abajo (44 px).

| Tiempo | Captura y movimiento | `variant="en"` | `variant="pitch"` |
|---|---|---|---|
| 0–4 s | `C1.png`, acercamiento lento | NASA Earth data. Your town. 45 years. | Elige tu lugar |
| 4–10 s | `C12.png`; tres `<Tap>` sobre las respuestas (Warmer, More rain, Drier), una cada 1.5 s | First, predict what changed. | Predice |
| 10–15 s | `C13.png`; acercamiento al "2 of 3" y después a la cifra +2.4 °C | Delicias, Chihuahua: +2.4 °C since 1981. Not chance. | Revela |
| 15–20 s | `C5.png` se funde en `C4.png` | Remove the seasons. Then test the trend. | ¿Es real? |
| 20–25 s | `C7.png`, revelada fila por fila (máscara de arriba abajo) | Not one town: every zone of Chihuahua. | Todo Chihuahua |
| 25–30 s | `D1.png` al centro; debajo, `earth-system-trend-detective-xi.vercel.app` | Students become climate detectives. | Tu caso |

## Los 7 clips del pitch

**Clip 1 · Gancho (25 s).** `<Stripes>` ocupa el ancho de la pantalla y se revela de 1981 a 2025 en unos 10 s. Al llegar a 2025, **+2.1 °C** cuenta hacia arriba, en ámbar, con *"Estado de Chihuahua, desde 1981"* debajo. Luego `C10.png` entra con un acercamiento lento. Texto: **"Chihuahua está en el 4 % de los lugares del mapa que más rápido se calientan."**

**Clip 2 · El problema (30 s).** Las franjas de fondo al 25 % de opacidad. Frases una por una, unos 6 s cada una: **"Los datos existen: 45 años de NASA."** → **"No llegan a quienes viven de esta tierra."** → **"Los teléfonos se hicieron para consumir."** → **"Ellos van a heredar la tierra y el agua de Chihuahua."** Al final, `C11.png` entra desde abajo.

**Clip 3 · La herramienta (45 s).** `DemoPitch` completa (30 s) y después 15 s quieta en su último cuadro. **No hace bucle**: en la diapositiva se reproduce una vez mientras el equipo la narra.

**Clip 4 · Por qué es confiable (35 s).** `C5.png` se funde en `C4.png`. Aparecen tres pasos numerados, uno por uno: **"1. Quitamos las estaciones"** · **"2. Medimos el cambio"** · **"3. ¿Pudo ser azar? p < 0.001"**. Al final: **"Confirmado con ERA5 (Europa) y estaciones del SMN"** y, más pequeño, *"Descriptivo, no es un pronóstico"*.

**Clip 5 · De consumir a investigar (40 s).** `C13.png` primero. Luego `D1.png`, `D2.png` y `D3.png` entran como cartas en abanico, rotadas −6°, 0° y +6°. Al final, una de las tarjetas se desliza hacia una casa dibujada con líneas simples (SVG con un trazo que se dibuja: techo de dos aguas y puerta, sin ilustración detallada). Texto: **"Primero la curiosidad, después la evidencia."** → **"Cada estudiante se lleva su caso."** → **"Y llega a casa."**

**Clip 6 · Quién lo hace posible (35 s).** Diagrama de 4 nodos (tarjetas redondeadas) unidos por líneas que se dibujan (SVG con `strokeDashoffset` interpolado): **Jóvenes** (investigan) → **Nosotros** (tecnología y talleres) → **Expertos** (agronomía y zootecnia UACH, estadística) → **Datos de NASA**. Solo texto: **sin logos** de NASA, UACH ni ninguna institución.

**Clip 7 · Cierre (30 s).** `C7.png` aparece fila por fila. Texto: **"No es un pueblo: es todo Chihuahua."** → **"Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante puede convertir el suyo en un instrumento científico."** → **"Earth System Trend Detective"** · `earth-system-trend-detective-xi.vercel.app` · *Datos: NASA POWER*. Queda quieto unos 3 s antes del bucle.

## Reglas que no se pueden romper

1. **Solo estas cifras**, escritas exactamente así: +2.1 °C (estado de Chihuahua), +2.4 °C (Delicias), 4 %, 45 años, 1981, 2025, p < 0.001, +2.0 a +2.4 °C (las 8 zonas), 2 of 3. Las anomalías de las franjas vienen del JSON y no se escriben en pantalla. **Ninguna cifra de lluvia** escrita por ti (las capturas pueden mostrarlas; no las amplíes ni las destaques).
2. Nunca escribas "más rápido que el planeta" (el mapa incluye océano): siempre "de los lugares del mapa".
3. Sin logos, banderas ni identificadores de misión de NASA ni de ninguna institución.
4. Sin imágenes, ilustraciones, voces ni música generadas por IA. Solo las capturas, el JSON, formas geométricas y tipografía.
5. La marca de agua de IA aparece en **todas** las composiciones, todo el tiempo.
6. Textos exactamente como están arriba: puedes partir líneas, no reescribirlos.

## Al final

Agrega una nota breve con la duración de cada composición, qué archivos de `public/` usa cada una y qué valores de `src/taps.ts` hay que revisar.

---

## Después: exportar a MP4 (lo hace el equipo)

Requisitos: Node.js 18 o superior.

1. Crea una carpeta con los archivos que entregó Claude y copia a `public/` las capturas (`C1.png`, `C2.png`, …, `D3.png`) y `video-stripes-chihuahua.json`.
2. `npm install`
3. Vista previa: `npx remotion studio`. Abran `DemoPitch`, ajusten en `src/taps.ts` las coordenadas de los toques hasta que caigan sobre los botones, y revisen cada clip.
4. Exportar:

```bash
for c in DemoEn DemoPitch Clip1Gancho Clip2Problema Clip3Herramienta Clip4Confiable Clip5Investigar Clip6Quien Clip7Cierre PitchCompleto; do
  npx remotion render "$c" "out/$c.mp4" --codec=h264
done
```

5. Revisen en cada MP4 que la marca de agua se vea y que las cifras cumplan la regla 1.
6. **`DemoEn.mp4` es el video que se sube a Space Apps.** `Clip1`–`Clip7` van en sus diapositivas: reproducción automática, sin sonido, como archivo local; en bucle todos **menos `Clip3`** (la demo se reproduce una vez mientras la narran). `PitchCompleto` es un respaldo por si fallan los videos incrustados.

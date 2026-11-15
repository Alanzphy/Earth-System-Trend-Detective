# Prompt para Claude: videos del pitch con Remotion

> **Cómo usarlo:** abre Claude (app de escritorio), adjunta **las capturas** (`C1.png` … `D3.png`) y **`video-stripes-chihuahua.json`**, y pega todo el texto que está entre las líneas `---`. El prompt es autocontenido: no hace falta adjuntar otros documentos. Claude escribe un proyecto de **Remotion** y ustedes lo exportan a MP4 (instrucciones al final).

---

Necesito que crees videos con **Remotion** (v4, TypeScript, React). Te explico todo el contexto, porque no lo conoces.

## 1. Contexto

Somos un equipo de 3 estudiantes de Chihuahua, México, en **NASA Space Apps Challenge 2026**, un hackathon internacional. Nuestro reto es "Be An Earth System Trend Detective": ayudar a estudiantes a descubrir, con datos de NASA, qué está cambiando en el clima de su región, cuánto, y si el cambio es real o pudo ser casualidad.

Hicimos una app web, **Earth System Trend Detective**, para jóvenes de 12 a 18 años de escuelas públicas de Chihuahua. Funciona así:

1. El estudiante **elige su lugar**; por ejemplo, Delicias, una zona agrícola del estado de Chihuahua.
2. Antes de ver los datos, **hace una predicción**: responde tres preguntas (¿más calor o menos?, ¿más lluvia o menos?, ¿suelo más húmedo o más seco?).
3. **Revela** los datos: la app le dice cuántas acertó ("You called 2 of 3") y le muestra qué cambió desde 1981, con 45 años de datos de NASA. En Delicias, la temperatura subió **+2.4 °C**.
4. Ve **cómo sabemos que es real**: la app quita el ciclo de verano e invierno para ver la tendencia de fondo y prueba si pudo ser casualidad (p < 0.001, es decir, menos de 1 en 1,000).
5. Guarda su **tarjeta de caso**: una imagen con su hallazgo, su apodo y su escuela, que puede compartir y enseñar en casa.

La idea central del proyecto es **"de consumir a investigar"**: los jóvenes usan el teléfono para consumir contenido; aquí lo usan como instrumento científico.

La app está en inglés (lo exige el concurso), pero vamos a presentar en español ante jueces de Chihuahua.

## 2. Qué necesito

Vamos a presentar un **pitch en vivo de 4 minutos con 7 diapositivas**, en español. Necesito:

1. **Un video corto animado para cada diapositiva** (7 clips), que se reproduce dentro de la diapositiva mientras hablamos.
2. **Una demo de 30 s** de la app, armada con las capturas que te adjunto, en dos versiones:
   - **Para el pitch**: va dentro de la diapositiva 3 y nosotros la narramos encima, así que solo lleva un título corto en español por escena.
   - **Para el concurso**: es el video oficial que subimos a Space Apps, con subtítulos completos en inglés.

## 3. Lo que te adjunto

Puedes ver las imágenes: úsalas tal cual. **No dibujes ni inventes pantallas de la app.** Si te falta una, dímelo.

| Archivo | Qué es |
|---|---|
| `video-stripes-chihuahua.json` | 45 "franjas de calentamiento" reales del estado de Chihuahua, una por año de 1981 a 2025: `{ year, anomaly, color }`. Cada franja es un año, azul si fue más frío de lo normal y rojo si fue más caliente. Usa **estos colores en este orden**; no inventes otros |
| `C1.png` | Portada de la app: "Is your town changing?" y el selector de lugar |
| `C2.png` | Tarjeta de Delicias: franjas, **+2.4 °C** y "Statistically significant" |
| `C4.png` | Gráfica sin las estaciones, con la línea de tendencia naranja subiendo |
| `C5.png` | Gráfica con los datos crudos, donde se ven las olas de verano e invierno |
| `C7.png` | Tabla de las 8 zonas del estado de Chihuahua, todas calentándose |
| `C10.png` | Mapa del mundo con las zonas que más se calientan en rojo; Chihuahua resalta |
| `C11.png` | La app vista en un teléfono |
| `C12.png` | Pantalla de predicción: "Before you look", con 3 preguntas y sus opciones |
| `C13.png` | Resultado de la predicción: "You called 2 of 3 before looking" y debajo +2.4 °C |
| `D1.png`, `D2.png`, `D3.png` | Tres tarjetas de caso guardadas por estudiantes de ejemplo (apodos Ana, Luis y Sofi) |

## 4. La demo de 30 s

Una composición `Demo30s` con la prop `variant: "pitch" | "en"`. Capturas a pantalla completa sobre fondo `#0f1a3a`, con acercamientos lentos (escala de 1.0 a 1.15 como máximo) y fundidos de 12 cuadros entre escenas.

| Tiempo | Qué se ve | Subtítulo (`en`) | Título corto (`pitch`) |
|---|---|---|---|
| 0–4 s | `C1.png`, acercamiento lento | NASA Earth data. Your town. 45 years. | Elige tu lugar |
| 4–10 s | `C12.png`, con tres "toques" sobre las respuestas **Warmer**, **More rain** y **Drier**, uno cada 1.5 s | First, predict what changed. | Predice |
| 10–15 s | `C13.png`: acercamiento al "2 of 3" y después a +2.4 °C | Delicias, Chihuahua: +2.4 °C since 1981. Not chance. | Revela |
| 15–20 s | `C5.png` se funde en `C4.png` | Remove the seasons. Then test the trend. | ¿Es real? |
| 20–25 s | `C7.png`, revelada fila por fila de arriba abajo | Not one town: every zone of Chihuahua. | Todo Chihuahua |
| 25–30 s | `D1.png` al centro y debajo `earth-system-trend-detective-xi.vercel.app` | Students become climate detectives. | Tu caso |

- **Toque**: un círculo blanco semitransparente de unos 56 px que aparece, se encoge un poco y se desvanece, como un dedo tocando la pantalla. **Mira `C12.png` y colócalo sobre cada botón.** Deja las coordenadas en `src/taps.ts`, con un comentario por toque, por si hay que ajustarlas.
- **Subtítulos (`en`)**: abajo, sobre una franja oscura semitransparente, 44 px.
- **Títulos cortos (`pitch`)**: arriba a la izquierda, 56 px, peso 800. Son cortos porque nosotros hablamos encima.
- La demo no se repite en bucle.

## 5. Los 7 clips del pitch

Para cada diapositiva te digo **de qué hablamos** en ese momento, para que la animación lo acompañe, y **qué debe verse**. Todos los clips se repiten en bucle (salvo el 3): en los últimos 20 cuadros vuelve exactamente al estado del primer cuadro, para que no se note el corte.

**Clip 1 · El gancho (25 s).** *Decimos:* Chihuahua está entre los lugares del mundo que más rápido se calientan; desde 1981 el estado subió 2.1 grados y Delicias 2.4; esa cifra por municipio no estaba publicada y la calculamos nosotros con datos de NASA. *Se ve:* las 45 franjas del JSON aparecen una por una, de izquierda a derecha, durante unos 10 s, con un contador de año (1981 → 2025). Al terminar, **+2.1 °C** cuenta desde 0 en ámbar, con "Estado de Chihuahua, desde 1981" debajo. Después entra `C10.png` con un acercamiento lento y el texto **"Chihuahua está en el 4 % de los lugares del mapa que más rápido se calientan."**

**Clip 2 · El problema (30 s).** *Decimos:* los datos existen pero no llegan a los jóvenes; usan el teléfono para consumir; muchos son hijos de familias que siembran y van a heredar la tierra y el agua. *Se ve:* las franjas de fondo, muy tenues (25 %), y una frase a la vez, unos 6 s cada una: **"Los datos existen: 45 años de NASA."** → **"No llegan a quienes viven de esta tierra."** → **"Los teléfonos se hicieron para consumir."** → **"Ellos van a heredar la tierra y el agua de Chihuahua."** Al final, `C11.png` sube desde abajo.

**Clip 3 · La herramienta (45 s).** *Decimos:* narramos la demo. *Se ve:* la demo en versión `pitch` (30 s) y después 15 s quieta en su último cuadro. **No hace bucle.**

**Clip 4 · Por qué es confiable (35 s).** *Decimos:* quitamos las estaciones, medimos la tendencia, probamos si pudo ser casualidad, y lo comprobamos con otras fuentes. *Se ve:* `C5.png` se funde en `C4.png`. Aparecen tres pasos, uno por uno: **"1. Quitamos las estaciones"** · **"2. Medimos el cambio"** · **"3. ¿Pudo ser azar? p < 0.001"**. Al final: **"Confirmado con ERA5 (Europa) y estaciones del SMN"**, y más pequeño, *"Descriptivo, no es un pronóstico"*. (ERA5 es un conjunto de datos climáticos europeo, independiente de NASA; el SMN es el Servicio Meteorológico Nacional de México.)

**Clip 5 · De consumir a investigar (40 s).** *Decimos:* el estudiante predice, descubre y se lleva su caso; la tarjeta llega a casa y la enseña a su familia. *Se ve:* `C13.png` primero; luego `D1.png`, `D2.png` y `D3.png` entran como cartas en abanico (rotadas −6°, 0° y +6°); al final, una tarjeta se desliza hacia una casa dibujada con líneas simples (un techo de dos aguas y una puerta, trazados con SVG). Textos: **"Primero la curiosidad, después la evidencia."** → **"Cada estudiante se lleva su caso."** → **"Y llega a casa."**

**Clip 6 · Quién lo hace posible (35 s).** *Decimos:* los jóvenes investigan, nosotros ponemos la herramienta y el taller, expertos de la universidad validan, y NASA pone los datos. *Se ve:* 4 tarjetas redondeadas unidas por líneas que se dibujan: **Jóvenes** (investigan) → **Nosotros** (tecnología y talleres) → **Expertos** (agronomía y zootecnia UACH, estadística) → **Datos de NASA**. Solo texto, **sin logos**.

**Clip 7 · Cierre (30 s).** *Decimos:* no es un pueblo, son las 8 zonas; lo que sigue; y la frase final. *Se ve:* `C7.png` aparece fila por fila. Textos: **"No es un pueblo: es todo Chihuahua."** → **"Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante puede convertir el suyo en un instrumento científico."** → **"Earth System Trend Detective"**, `earth-system-trend-detective-xi.vercel.app` y, pequeño, *Datos: NASA POWER*. Se queda quieto 3 s antes del bucle.

## 6. Estilo

- **Colores**: fondo azul noche `#0f1a3a` (variantes `#1a2856` y `#24346b`); texto `#f4f6ff`, secundario `#b4bee0`; cifras en ámbar `#ffb347` o naranja `#ff6a1a`; "verificado" en celeste `#9fd7ff`.
- **Tipografía**: **Archivo** (pesos 800–900) para cifras y títulos; **JetBrains Mono** solo para años y p-valores. Cárgalas con `@remotion/google-fonts`.
- **Legibilidad**: se proyecta en un salón, así que el texto de los clips va a **48 px o más**, con máximo 2 líneas y márgenes de 120 px.
- **Movimiento**: entradas suaves (`Easing.out(Easing.cubic)` o `spring` sin rebote, `damping` ≥ 200) de 18 a 27 cuadros. Una idea a la vez. Las cifras cuentan desde 0 en un segundo y se quedan quietas. **Nada de** rebotes, partículas, giros 3D, brillos, emojis ni íconos genéricos.

## 7. Reglas (son del concurso o protegen la credibilidad de los datos)

1. **Solo estas cifras**, escritas exactamente así: +2.1 °C (estado de Chihuahua), +2.4 °C (Delicias), 4 %, 45 años, 1981, 2025, p < 0.001, +2.0 a +2.4 °C (las 8 zonas), 2 of 3. No escribas ninguna otra cifra. **No escribas ni destaques cifras de lluvia**: la tendencia de lluvia es menos sólida que la de temperatura.
2. Nunca escribas "más rápido que el planeta": nuestro mapa incluye océano, así que siempre es "de los lugares del mapa".
3. **Sin logos, banderas ni insignias de NASA** ni de ninguna institución: el concurso lo prohíbe.
4. **Sin imágenes, ilustraciones, voces ni música generadas por IA.** Solo las capturas, el JSON, formas geométricas y tipografía.
5. **Marca de agua obligatoria** (el concurso exige señalar lo hecho con IA): en todas las composiciones, todo el tiempo, abajo a la derecha, 18 px, opacidad 0.7, color `#f4f6ff`. En español: **"Animación hecha con asistencia de IA (Claude)"**. En la demo en inglés: **"Motion graphics made with AI assistance (Claude)"**.
6. Usa los textos exactamente como están: puedes partir líneas, no reescribirlos.
7. Sin audio.

## 8. Qué me entregas

Un proyecto de Remotion completo, listo para `npm install` y `npx remotion render`. Escribe **todos los archivos completos**, sin "..." ni partes por rellenar:

```
package.json            remotion, @remotion/cli, @remotion/google-fonts, react, react-dom, typescript
remotion.config.ts
src/index.ts            registerRoot
src/Root.tsx            todas las composiciones
src/theme.ts            colores, tipografías, tamaños
src/taps.ts             coordenadas de los toques de la demo
src/components/         marca de agua, franjas, contador, subtítulo, toque, acercamiento
src/Demo30s.tsx
src/clips/Clip1Gancho.tsx … Clip7Cierre.tsx
public/                 aquí pondremos las capturas y el JSON
```

Todas las composiciones a **1920 × 1080 y 30 fps**:

| id | Duración |
|---|---|
| `DemoPitch` (`Demo30s`, `variant="pitch"`) | 30 s = 900 cuadros |
| `DemoEn` (`Demo30s`, `variant="en"`) | 30 s = 900 |
| `Clip1Gancho` | 25 s = 750 |
| `Clip2Problema` | 30 s = 900 |
| `Clip3Herramienta` | 45 s = 1350 |
| `Clip4Confiable` | 35 s = 1050 |
| `Clip5Investigar` | 40 s = 1200 |
| `Clip6Quien` | 35 s = 1050 |
| `Clip7Cierre` | 30 s = 900 |
| `PitchCompleto` (los 7 clips seguidos) | 240 s = 7200 |

**Cuestiones técnicas de Remotion:** anima solo con `useCurrentFrame`, `interpolate` (con `extrapolateLeft` y `extrapolateRight` en `"clamp"`), `spring` y `Easing`, **sin animaciones CSS ni `setTimeout`**. Carga las imágenes con `<Img src={staticFile("C2.png")} />`; el JSON puedes importarlo directamente.

**Antes del código**, dime qué archivos usa cada composición. **Al final**, una nota breve con la duración de cada composición y qué coordenadas de `src/taps.ts` conviene revisar.

---

## Después: exportar a MP4 (lo hace el equipo)

Requisitos: Node.js 18 o superior.

1. Crea una carpeta con los archivos que entregó Claude y copia a `public/` las capturas (`C1.png` … `D3.png`) y `video-stripes-chihuahua.json`.
2. `npm install`
3. Vista previa: `npx remotion studio`. Revisen `DemoPitch` (que los toques caigan sobre los botones; si no, ajusten `src/taps.ts`) y cada clip.
4. Exportar:

```bash
for c in DemoEn DemoPitch Clip1Gancho Clip2Problema Clip3Herramienta Clip4Confiable Clip5Investigar Clip6Quien Clip7Cierre PitchCompleto; do
  npx remotion render "$c" "out/$c.mp4" --codec=h264
done
```

5. Revisen en cada MP4 que la marca de agua se vea y que las cifras cumplan la regla 1.
6. **`DemoEn.mp4` es el video que se sube a Space Apps.** `Clip1`–`Clip7` van en sus diapositivas: reproducción automática, sin sonido, como archivo local; en bucle todos **menos `Clip3`**. `PitchCompleto` es un respaldo por si fallan los videos incrustados.

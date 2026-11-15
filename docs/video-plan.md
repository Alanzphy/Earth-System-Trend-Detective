# Plan de producción: video de entrega, video dinámico del pitch y capturas

> Documento autocontenido para quien produzca el material (una persona o Claude, de Anthropic, en la app de escritorio). No hace falta otro contexto: aquí está qué es el proyecto, qué mensaje transmitir, qué capturar, cómo animarlo y cómo exportarlo. **Todas las cifras de este documento salen de la app** (NASA POWER 1981–2025) y se pueden comprobar en las URLs indicadas.

## 1. Qué es el proyecto

- **Earth System Trend Detective**, NASA Space Apps Challenge 2026, reto *"Be An Earth System Trend Detective"*: una herramienta para que estudiantes descubran **qué cambia, dónde, cuánto y si el cambio es significativo** en variables del sistema Tierra.
- **Para quién**: jóvenes de 12–18 años de escuelas públicas de Chihuahua (México), desde el teléfono. El equipo ya da talleres en escuelas públicas.
- **Idea central: de consumir a investigar.** "Los teléfonos se hicieron para consumir, no para crear." El estudiante elige su lugar, lee 45 años de datos de NASA y se lleva una **tarjeta de caso** con su hallazgo, con su alias, para compartir.
- **Hallazgos reales** (todos estadísticamente significativos):
  - Delicias: **+2.4 °C** desde 1981 y **−118 mm** de lluvia al año (−34 %).
  - Cuauhtémoc: **−167 mm** de lluvia al año (−34 %) y **−11 %** de humedad del suelo.
  - Las 8 zonas de Chihuahua: **+2.0 a +2.4 °C** y **28–39 % menos lluvia**.
  - Estado de Chihuahua: **+2.1 °C**, **−143 mm** al año (−32 %); se calienta **unas 2.5 veces** el promedio del mapa mundial de la app y está en el **4 %** de celdas que más rápido se calientan.
  - Misma variable, direcciones opuestas: lluvia **−32 %** en Chihuahua y **+8 %** (+45 mm) en el Sahel occidental.
- **Modelo**: los jóvenes investigan; el equipo pone la tecnología y la experiencia en talleres; expertos (agronomía UACH, estadística) validan; NASA pone los datos. El equipo reconoce sus límites y busca apoyo experto.
- **Tono**: curiosidad de detective, asombro, rigor. **Nunca** alarmista, infantil ni de dashboard corporativo. Es **descriptivo, no un pronóstico** ni consejo agrícola.

## 2. Entregables

| # | Entregable | Para qué | Formato |
|---|---|---|---|
| A | **Video de entrega** | Se sube a Space Apps | MP4 H.264, 1920 × 1080, **≤ 30 s**, subtítulos en **inglés**, sin voz |
| B | **Video dinámico del pitch** | Se proyecta mientras el equipo expone 4 min en español | 7 clips MP4 1920 × 1080 (uno por diapositiva, en bucle) + una versión continua de 4:00 |
| C | **Capturas** | Material base de A y B | PNG 1920 × 1080 a escala 2× (3840 × 2160 si es posible) y de teléfono (390 × 844 a 3×) |
| D | **Tarjetas de caso** | Momento "se lleva su caso" | PNG que genera la app (botón *Save my case card*) |

## 3. Reglas obligatorias

1. **Video de entrega en inglés.** El video del pitch lleva texto en **español** (el pitch es en español).
2. **Sin logos, banderas ni identificadores de misión de NASA**, ni logos de instituciones (UACH, etc.): solo sus nombres en texto.
3. **IA**: si una IA (por ejemplo Claude) compone, anima o genera cualquier parte de un video o imagen, ese archivo debe llevar **una marca de agua visible** durante todo el video, p. ej. esquina inferior derecha, 18 px, 70 % de opacidad: *"Motion graphics made with AI assistance (Claude)"* en A y *"Animación hecha con asistencia de IA (Claude)"* en B. Una grabación de pantalla hecha por una persona, sin edición con IA, no la necesita. Nunca voces generadas por IA.
4. **Solo cifras reales de la app.** Si algo en pantalla no coincide con este documento, manda la pantalla y se corrige el texto.
5. **Privacidad**: alias o nombre de pila de ejemplo (`Ana`, `Luis`) y escuela genérica (`Secundaria 12`). Nunca nombres completos ni datos reales de menores.
6. Sin música con derechos; si se usa, libre de derechos y muy baja (en el pitch, mejor sin audio).

## 4. Sistema visual (el mismo de la app)

| Rol | Valor |
|---|---|
| Fondo nocturno | `#0f1a3a` (variantes `#1a2856`, `#24346b`) |
| Texto sobre noche | `#f4f6ff`, secundario `#b4bee0` |
| Acción / cifra principal | naranja `#ff6a1a`, ámbar `#ffb347` |
| "Verificado" | celeste `#9fd7ff` |
| Papel | `#f3f5fb` |
| Calor / frío (franjas y mapa) | escala RdBu: azul `#2166ac` → blanco `#f7f7f7` → rojo `#b2182b` |
| Seco / húmedo | marrón `#8c510a` / verde azulado `#01665e` |
| Tipografía | **Archivo** (Google Fonts, eje de ancho: expandida y negra para cifras y títulos) + **JetBrains Mono** solo para evidencia (p-valor, IC, años) |

**Lenguaje de movimiento**: una sola idea por escena; entradas con *ease-out* suave (600–900 ms); nada de rebotes, partículas ni giros 3D. La **firma** es la revelación de las **franjas anuales de izquierda a derecha, año por año de 1981 a 2025**, con un contador de año. Las cifras **cuentan hacia su valor** (0 → +2.4 °C) en ~1 s y se quedan quietas para leerse. Respetar márgenes de 120 px; texto en pantalla de 2 líneas como máximo.

## 5. Preparación y capturas (base para A y B)

**URL**: `https://earth-system-trend-detective-xi.vercel.app`. Antes de capturar, comprobar que se ve la banda azul con **"Is your town changing?"** y, más abajo, la sección **"Cases from Chihuahua"**. Si no, avisar al equipo.

Navegador a **1600 × 900** (o 1920 × 1080), zoom 100 %, sin barra de marcadores. Para el mapa, bajar a *Where is it changing fastest?* y esperar ~10 s a que se vean las celdas de color antes de capturar.

| ID | Captura | URL / acción | Debe verse |
|---|---|---|---|
| C1 | Portada | `/?place=delicias&var=temperature_2m`, arriba | "Is your town changing?", selector con Delicias |
| C2 | Tarjeta Delicias | misma URL, bajar a la tarjeta | Franjas, **+2.4 °C**, "Statistically significant … p < 0.001", cuadrícula de 8 variables |
| C3 | Lluvia Delicias | clic en **Rain** | **−118 mm**, "less rain per year since 1981 (−34%)" |
| C4 | Evidencia sin estaciones | *How we know it's real*, vista **Without seasons** | Línea naranja de tendencia subiendo |
| C5 | Evidencia cruda | vista **Raw monthly values** | Ondas de verano/invierno |
| C6 | Casos | sección **Cases from Chihuahua** | 4 casos con cifras |
| C7 | Tabla 8 zonas | caso **Not one town: all of Chihuahua** | 8 filas con franjas, +2.0 a +2.4 °C, −28 % a −39 % |
| C8 | Lluvia opuesta | caso **Same rain, opposite directions** | **−143 mm** Chihuahua, **+45 mm** Sahel |
| C9 | Comparación | botón **Compare them** | Dos tarjetas lado a lado |
| C10 | Mapa mundial | `/?place=chihuahua-state&var=temperature_2m` → *Where is it changing fastest?* | Mapa nocturno con celdas rojas; texto "2.5 times … top 4%" |
| C11 | Teléfono | modo dispositivo (iPhone, 390 × 844) en `/?place=delicias&var=temperature_2m` | Tarjeta completa en vertical |
| D1–D3 | Tarjetas de caso | en Delicias, Cuauhtémoc y Ciudad Juárez: **Save my case card** → alias `Ana`, `Luis`, `Sofi`; escuela `Secundaria 12` → **Save image** | PNG 1080 × 1350 de cada caso |

**Grabación de interacciones** (para A y la escena 3 de B): grabar en pantalla (macOS `Cmd + Shift + 5`, o QuickTime) los clics de la sección 6, con el cursor lento y pausas de ~1 s sobre cada cifra.

## 6. Entregable A: video de entrega (30 s, inglés)

| # | Tiempo | Qué se ve | Subtítulo |
|---|---|---|---|
| 1 | 0:00–0:05 | C1: portada, quieta | **NASA Earth data. Your town. 45 years.** |
| 2 | 0:05–0:11 | Bajada a C2; quieto en la cifra | **Delicias, Chihuahua: +2.4 °C since 1981. Not chance.** |
| 3 | 0:11–0:16 | Clic en **Rain** (C3), luego **Soil moisture** | **Less rain. Drier soil. Eight variables at once.** |
| 4 | 0:16–0:21 | **Raw monthly values** → **Without seasons** (C5 → C4) | **Remove the seasons. Then test the trend.** |
| 5 | 0:21–0:26 | Casos: tabla de 8 zonas (C7) | **Not one town: every zone of Chihuahua.** |
| 6 | 0:26–0:30 | **Save my case card** → la imagen D1 a pantalla completa + URL | **Students become climate detectives.** · `earth-system-trend-detective-xi.vercel.app` |

Subtítulos: blanco sobre franja oscura semitransparente abajo, Archivo o Helvetica ~44 px, ≥ 2.5 s cada uno. Si el video se edita o compone con IA, marca de agua (regla 3).

## 7. Entregable B: video dinámico del pitch (4 min, español)

Se proyecta **detrás del equipo** mientras habla. Se entrega **por clips, uno por diapositiva, cada uno en bucle** (si el orador se alarga, la imagen no se queda en negro), y además una versión continua de 4:00. Texto en pantalla en **español**, poco y grande: el protagonista es la voz del equipo.

| # | Tiempo | Clip (duración) | Qué se anima | Texto en pantalla | Lo que dice el equipo (referencia) |
|---|---|---|---|---|---|
| 1 | 0:00–0:25 | **Gancho** (25 s, bucle) | Fondo nocturno. Las franjas del **estado de Chihuahua** aparecen año por año (contador 1981 → 2025, azules → rojos). Al llegar a 2025 cuenta **+2.1 °C**. Después, el mapa mundial (C10) con Chihuahua resaltado. | **Chihuahua está en el 4 % de los lugares del mapa que más rápido se calientan.** (Nunca "más rápido que el planeta": el mapa incluye océano.) | El dato real, local, con NASA |
| 2 | 0:25–0:55 | **El problema** (30 s) | Tipografía cinética sobre las franjas atenuadas, una frase a la vez. Al final, C11 (teléfono) entra desde abajo. | **Los datos existen: 45 años de NASA.** → **No llegan a quienes viven de esta tierra.** → **Los teléfonos se hicieron para consumir.** → **Ellos van a heredar la tierra y el agua de Chihuahua.** | Talleres en escuelas públicas; que decidan con datos, no solo con percepción |
| 3 | 0:55–1:40 | **La herramienta** (45 s) | La grabación de interacciones (sección 6, escenas 1–4) dentro de un marco de laptop o teléfono dibujado con formas simples, con títulos breves: "Elige tu lugar", "Qué cambió", "¿Es real?". | Títulos de 2–3 palabras | Demo narrada en vivo |
| 4 | 1:40–2:15 | **Por qué es confiable** (35 s) | C5 (ondas de estaciones) se transforma en C4 (sin estaciones); la línea de tendencia se dibuja; aparecen 3 pasos numerados uno por uno. | **1. Quitamos las estaciones · 2. Medimos el cambio · 3. ¿Pudo ser azar? p < 0.001** · *Descriptivo, no es un pronóstico* | Validez científica |
| 5 | 2:15–2:55 | **De consumir a investigar** (40 s) | Las tarjetas D1–D3 entran como cartas en abanico; cada una muestra su alias. Luego se ve C3/C2 en el teléfono con "Save my case card". | **Cada estudiante se lleva su caso.** → **Lo comparte con su nombre de detective.** | Mecanismo de impacto, retos semanales para clubes |
| 6 | 2:55–3:30 | **Quién lo hace posible** (35 s) | Diagrama de 4 nodos que se conectan con líneas: **Jóvenes** (investigan) → **Nosotros** (tecnología + talleres) → **Expertos** (agronomía UACH, estadística) → **Datos de NASA**. Sin logos. | Nombres de los nodos | Límites del equipo; apoyo de expertos; formato tipo Las Niñas Sí Pueden |
| 7 | 3:30–4:00 | **Cierre** (30 s, bucle) | La tabla de 8 zonas (C7) entra fila por fila; luego "misma lluvia, direcciones opuestas" (C8: −32 % vs +8 %); final: frase de cierre, luego título + URL, quieto. | **No es un pueblo: es todo Chihuahua.** → **Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante puede convertir el suyo en un instrumento científico.** → **Earth System Trend Detective** · URL · *Datos: NASA POWER* | Siguientes pasos: piloto en escuelas, versión en español, atlas de casos |

**Cómo producirlo** (sugerencia para Claude): una página HTML/CSS/JS por clip a 1920 × 1080 que use las capturas reales como imágenes y anime con CSS o una línea de tiempo en JS (o Remotion si está disponible); exportar con grabación de pantalla a 60 fps o render de Remotion; recortar a la duración exacta; asegurar que el último cuadro empate con el primero para el bucle. Incluir la marca de agua de la regla 3 en todos los clips.

**En la presentación**: insertar cada clip en su diapositiva como archivo local (no desde internet), reproducción automática, en bucle, sin sonido.

## 8. Qué no decir ni mostrar

- No afirmar que ya hay un piloto, escuelas aliadas, convenios o resultados con estudiantes: es el **siguiente paso**.
- No presentar tendencias como pronóstico ("en 2050…", "va a…").
- No usar Iberia como ejemplo principal; el foco es Chihuahua (el Sahel solo como contraste de lluvia).
- No destacar la evapotranspiración (su fuente se corrigió recientemente); usar temperatura, lluvia y humedad del suelo.
- No usar logos de NASA ni de instituciones; no inventar citas ni testimonios.

## 9. Comprobación final

- [ ] A dura ≤ 30 s, 1920 × 1080, MP4 H.264, en inglés.
- [ ] B: 7 clips en bucle + versión de 4:00, texto en español.
- [ ] Cada cifra mostrada coincide con la app (sección 1 y capturas).
- [ ] Marca de agua de IA visible en todo lo que haya compuesto o animado una IA.
- [ ] Sin logos de NASA ni de instituciones; sin voces generadas por IA.
- [ ] La URL final abre el diseño nuevo con la sección "Cases from Chihuahua".

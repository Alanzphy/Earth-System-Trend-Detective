# Product

<!-- impeccable:product-schema 1 -->

> **Estado: versión final para la entrega del 2026-11-15.** Fuente de verdad del **porqué** del proyecto: léela antes de cualquier trabajo de UI, video o texto de entrega. El **qué** técnico vive en `docs/` (`product.md`, `science.md`, `architecture.md`). Guion y material del pitch: `docs/submission.md`, `docs/video-plan.md`, `docs/pitch-qa.md`.

## Platform

web (pensada primero para el teléfono)

## Users

- **Jóvenes de 12 a 18 años de escuelas públicas de Chihuahua** (para quienes existe): secundaria y preparatoria, muchos de familias del campo o de la periferia urbana. Usan el teléfono con soltura, pero para consumir, no para investigar. Usan la app en un taller o en clase.
- **Docentes y talleristas**, empezando por el propio equipo, que ya da talleres en escuelas públicas: llevan la actividad al aula.
- **Jurado de NASA Space Apps** (decide): ve el pitch en vivo de 4 minutos (7 diapositivas, en español) y quizá abre el enlace unos minutos. Tiene que entender la historia y recordarla.

## Product Purpose

**De consumir a investigar.** Una herramienta que convierte el teléfono en un instrumento científico: el estudiante elige su lugar, lee 45 años de datos de NASA y descubre **qué cambió, dónde, cuánto y si es significativo**. El resultado es una **tarjeta de caso** con su hallazgo, su alias y su escuela, que se lleva y comparte.

**Éxito**: un estudiante elige su zona y explica, con cifras y su significancia, qué cambió desde 1981. Por ejemplo: "En Delicias subió 2.4 °C y llueve 118 mm menos al año, y no es azar."

## Mission, Vision and Impact

**Problema**: la información sobre cómo cambia el clima existe (décadas de datos de satélite y de modelos de NASA), pero no llega de forma comprensible a los jóvenes que vivirán de esta tierra. Sin ella, la conversación sobre agua y calor se basa solo en la percepción.

**Lo que está en juego** (frase de impacto, no público objetivo): muchos de estos jóvenes van a heredar la tierra y el agua de Chihuahua; que decidan con datos, no solo con percepción. El público son estudiantes de escuelas públicas en general, no solo de escuelas agrícolas: el equipo no promete un canal agrícola que hoy no tiene.

**Misión**: poner los datos de NASA en manos de estudiantes de Chihuahua para que midan por sí mismos qué cambia en su región, cuánto y si el cambio es real.

**Visión**: que cada joven pueda leer el clima de su tierra con evidencia, empezando por Chihuahua y extensible a cualquier lugar.

**Modelo**: los jóvenes investigan; el equipo pone la tecnología y la experiencia en talleres; los expertos (agronomía y zootecnia de la UACH, estadística) validan lo que se encuentra; NASA pone los datos. El equipo reconoce sus límites y busca ese apoyo experto. Un formato como el de Las Niñas Sí Pueden sirve de referencia para implementarlo.

**Impacto esperado** (meta, no resultado logrado):
- Corto plazo: estudiantes que interpretan una tendencia y distinguen un cambio significativo del azar.
- Mediano plazo: piloto en las escuelas públicas donde el equipo ya da talleres, retos semanales para clubes y un atlas de casos de estudiantes.
- Largo plazo: versión en español, combinación de sensores de campo con registros de satélite y uso en otras regiones.

**Qué no es**: no es un pronóstico, no da recomendaciones de siembra ni de riego, no sustituye la medición en campo ni resuelve la sequía. Es una herramienta para entender y discutir con evidencia.

### English (for the project page)

- **Mission**: Put NASA Earth data in the hands of students in Chihuahua, Mexico, so they can measure for themselves what is changing where they live, how much, and whether the change is real.
- **Vision**: Every young person able to read the climate of their land with evidence — starting in Chihuahua and applicable anywhere on Earth.
- **What it is not**: not a forecast, not farming advice, not a replacement for field measurements.

## Positioning

Un mapa con tendencias lo puede hacer cualquiera. Lo que no se copia:

- **El canal**: el equipo ya da talleres en secundarias y preparatorias públicas de Chihuahua. La herramienta nace para ese uso.
- **El estudiante como autor**: no consume una gráfica; produce un hallazgo con evidencia y se lo lleva en su tarjeta de caso.
- **Lugar real con datos contundentes**: Chihuahua, región agrícola golpeada por la sequía, con 8 zonas que el estudiante reconoce.
- **Rigor visible**: cada cifra lleva método, p-valor e intervalo; se distingue tendencia de azar y descripción de pronóstico; también se muestra lo que **no** cambió.
- **Origen**: el equipo trabajó con un rancho de la región en sensores IoT. Esos sensores responden "¿cómo está hoy mi parcela?", pero no "¿esto es normal o está cambiando?", y para eso hacen falta décadas de datos de NASA. Se presenta como origen y como siguiente paso, no como pericia.

## Operating Context

- Entrega: NASA Space Apps 2026, reto "Be An Earth System Trend Detective". Límite: **domingo 2026-11-15, 13:00 (hora de Chihuahua)**. Video de entrega ≤ 30 s en inglés; página del proyecto en inglés.
- Pitch en vivo: **4 minutos, 7 diapositivas, en español**, ante jueces locales, con un video dinámico de fondo (ver `docs/video-plan.md`). Sin presentación del equipo: las 7 diapositivas son para la historia.
- Criterios: **Impact, Creativity, Validity (incluye usabilidad), Relevance, Presentation** ([guía oficial](https://assets.spaceappschallenge.org/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf)). Premios afines: Local Impact, Most Inspirational, Best Storytelling.
- Uso real: taller o aula, con teléfono o proyector y conexión variable. La API gratuita puede estar dormida: los lugares, los casos y los mapas son estáticos, y el análisis en vivo espera hasta 90 s a que despierte.
- La idea de vincularlo al trabajo educativo del equipo vino del grupo de mentores.

## Capabilities and Constraints

- 8 variables mensuales de NASA POWER (1981–2025): temperatura, lluvia, humedad del suelo, evaporación, humedad relativa, radiación solar, viento y vapor de agua.
- 13 lugares precalculados (8 zonas de Chihuahua, el estado y 4 regiones del mundo), análisis en vivo de cualquier área, comparación de dos lugares, 4 casos de Chihuahua y mapas mundiales de tendencia con FDR.
- **Predice antes de ver**: al elegir un lugar, el estudiante apuesta (calor, lluvia, humedad del suelo) antes de ver los datos; al revelar, ve cuántas acertó y el puntaje va en su tarjeta. Despierta la curiosidad; nunca modifica los datos.
- **Descriptivo, no un pronóstico ni una recomendación agronómica.**
- Resolución de reanálisis (~0.5°): describe la región, no una parcela.
- Interfaz **en inglés** (requisito de Space Apps); el español es el primer paso del piloto.
- Sin logos, banderas ni identificadores de misión de NASA. Toda imagen, video o voz generada por IA lleva marca de agua visible.
- Privacidad: la tarjeta lleva alias o nombre de pila y escuela, se genera en el dispositivo y no se sube a ningún sitio.

## Evidence on Hand

Calculado con el código del proyecto (NASA POWER, anomalías mensuales, Theil–Sen + Mann–Kendall con corrección Hamed–Rao, α = 0.05), 1981-01 → 2025-12. Todo es significativo salvo donde se indica, y las cifras coinciden con la app.

| Lugar | Temperatura | Lluvia al año | Humedad del suelo |
|---|---|---|---|
| Delicias | +2.4 °C (p < 0.001) | −118 mm (−34 %) | −6 % |
| Cuauhtémoc | +2.3 °C | −167 mm (−34 %, p = 0.010) | −11 % (p = 0.044) |
| Las 8 zonas | +2.0 a +2.4 °C | −28 % a −39 % | — |
| Estado de Chihuahua | +2.1 °C | −143 mm (−32 %) | — |
| Sahel occidental (contraste) | — | +45 mm (+8 %) | — |

- Mapa mundial: el estado está en el **4 %** de las celdas que más rápido se calientan. Se calienta unas **2.5 veces el promedio del mapa**, no "del planeta": el mapa incluye océano.
- **Validación independiente** (`docs/validation.md`): el calentamiento lo confirman ERA5 (Delicias +3.1 °C, Cuauhtémoc +2.6 °C) y el INECC con estaciones (1985–2018); la cifra de NASA es la más prudente. La caída de lluvia depende del periodo: con estaciones hasta 2018 no hay cambio claro, así que **no es gancho** y siempre se dice con su periodo.
- Sin los años de sequía (1981–2019), la caída de lluvia sigue siendo significativa en el estado (p = 0.028) y en Delicias (p = 0.044), pero **no** en Cuauhtémoc (p = 0.14).
- En Delicias, el vapor de agua sale "No clear trend".

**Ausencias que no se inventan**: aún no hay piloto, testimonios, cifras de alcance ni alianzas. Se presentan como plan, nunca como hecho.

## Product Principles

1. **La historia manda, la herramienta la demuestra.** Cada pantalla responde a "¿qué cambió en mi lugar y es real?".
2. **Evidencia antes que opinión**: ninguna afirmación sin dato, método y p-valor; nunca alarmismo.
3. **Respuesta primero, evidencia a un toque**: la cifra clara arriba; el método, cuando se pide.
4. **El estudiante es autor**: el resultado es su caso, con su alias.
5. **Respeto por el saber local**: los datos confirman o matizan lo que la familia sabe; no lo sustituyen.
6. **No parecer un dashboard genérico**: si se ve hecho en 20 minutos, falla aunque funcione.

## Experience Goals

Sensaciones buscadas: curiosidad de detective, asombro, confianza científica, orgullo de haber descubierto algo.
Anti-objetivos: dashboard corporativo o plantilla, exceso de texto y controles, tono infantil o alarmista.

## Accessibility & Inclusion

Teléfonos de gama media y aulas con proyector: contraste AA, objetivos táctiles ≥ 44 px, significancia comunicada con palabra y no solo con color, alternativa de teclado para el mapa y `prefers-reduced-motion`.

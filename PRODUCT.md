# Product

<!-- impeccable:product-schema 1 -->

> Fuente de verdad del **porqué** del proyecto. Léelo antes de cualquier trabajo de UI, demo o texto de entrega. El **qué** técnico vive en `docs/` (`product.md`, `science.md`, `architecture.md`).

## Platform

web

## Users

- **Jurado de NASA Space Apps** (decide): ve un **video de ≤ 30 s** (grabado, no en vivo) y luego quizá abre el enlace unos minutos. Tiene que entender la historia y recordarla.
- **Estudiantes de bachillerato y universidad de familias agricultoras de Chihuahua** (para quienes existe): jóvenes que conocen el campo por su familia y se mueven con soltura en la tecnología. Usan la app en clase o en el teléfono.
- **Docentes** de bachilleratos agropecuarios (CBTA) y de carreras agrícolas (p. ej. UACH): llevan la actividad al aula.

## Product Purpose

Convertir a jóvenes de familias agricultoras en **detectives del clima de su propia tierra**: que comprueben con datos de NASA lo que sus familias perciben ("ya no llueve como antes"), midiendo qué cambia, dónde, cuánto y si es significativo.

**Éxito**: un estudiante pasa de "mi abuelo dice" a "los datos muestran +2.3 °C y 36 % menos lluvia desde 1981, y no es azar", y lo puede explicar.

## Positioning

La herramienta (mapa, tendencias, significancia) la puede hacer cualquiera. Lo que no se copia:

- **Puente entre generaciones**: la experiencia de la familia agricultora + la evidencia satelital. El joven no aprende estadística en abstracto: verifica la historia de su casa.
- **Lugar real con datos contundentes**: Chihuahua, región agrícola clave de México, golpeada por la sequía.
- **Rigor visible**: cada afirmación lleva método, p-valor e intervalo; se distingue tendencia de azar y descripción de pronóstico.

## Operating Context

- Entrega: NASA Space Apps 2026, reto "Be An Earth System Trend Detective". Límite: **2026-11-16, 13:00 (hora de Chihuahua)**. Video ≤ 30 s o ≤ 7 diapositivas; página del proyecto en inglés.
- Los jueces puntúan **Impact, Creativity, Validity (incluye usabilidad), Relevance, Presentation** ([guía oficial](https://assets.spaceappschallenge.org/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf)). Premios afines: Local Impact, Most Inspirational, Best Storytelling, Best Use of Data.
- Uso real: aula con proyector o teléfono; conexión variable; el backend gratuito puede estar dormido (demos y mapas son estáticos).
- La idea de vincularlo al trabajo educativo del equipo vino del grupo de mentores.

## Capabilities and Constraints

- 8 variables mensuales de NASA POWER (1981–2025), análisis de cualquier región, comparación de dos regiones, mapas mundiales de tendencia con FDR, demos estáticas.
- **Es descriptivo, no un pronóstico ni una recomendación agronómica.** El contexto agrícola motiva; la herramienta sigue siendo detección de tendencias para cualquier lugar.
- Resolución de reanálisis (~0.5°): describe la región, no una parcela.
- La interfaz debe estar **principalmente en inglés** (requisito); el español para el público local es deseable.
- Sin logos, banderas ni identificadores de misión de NASA.

## Evidence on Hand

Calculado con la API del proyecto (NASA POWER, anomalías mensuales, Theil–Sen + Mann–Kendall Hamed–Rao, α = 0.05), 1981-01 → 2025-12, n = 540:

| Región | Variable | Tendencia | En 45 años | p |
|---|---|---|---|---|
| Corredor Cuauhtémoc–Delicias `[-107.5, 27.5, -105, 29.5]` | Temperatura 2 m | +0.51 °C/década (IC 95 % 0.43–0.60) | +2.3 °C | < 0.001 |
| | Lluvia | −0.093 mm/día/década (IC −0.13 a −0.06) | ≈ −150 mm/año (−36 % de la media, 420 mm/año) | 0.002 |
| | Humedad del suelo (raíces) | −0.008 /década | −0.04 (escala 0–1) | 0.03 |
| | Humedad relativa | −1.8 %/década | −8 puntos | 0.02 |
| Estado de Chihuahua `[-109, 25.5, -103.3, 31.8]` | Temperatura 2 m | +0.48 °C/década | +2.1 °C | < 0.001 |
| | Lluvia | −0.087 mm/día/década | ≈ −143 mm/año (−32 %) | < 0.001 |

Cautelas que se dicen en voz alta: la caída de lluvia está influida por la sequía severa reciente; es reanálisis (MERRA-2), no estaciones locales.

**Ausencias que no se inventan**: aún no hay piloto con escuelas, testimonios, cifras de alcance ni alianzas. Si el equipo consigue contacto con un docente o escuela antes de la entrega, se documenta aquí con su evidencia; si no, se presenta como plan, no como hecho.

## Product Principles

1. **La historia manda, la herramienta la demuestra.** Cada pantalla responde a "¿qué cambió en mi tierra y es real?".
2. **Evidencia antes que opinión**: ninguna afirmación sin dato, método y p-valor; nunca alarmismo.
3. **Menos texto, más descubrimiento**: el estudiante explora; la explicación aparece cuando la pide.
4. **Respeto por el saber local**: los datos confirman o matizan lo que la familia sabe; no lo sustituyen.
5. **No parecer un dashboard genérico**: si se ve hecho en 20 minutos, falla aunque funcione.

## Experience Goals

Sensaciones buscadas: curiosidad de detective, asombro ante el planeta, confianza científica, ganas de explorar.
Anti-objetivos: dashboard corporativo o plantilla, exceso de texto y controles, tono infantil o alarmista.

## Accessibility & Inclusion

Teléfonos de gama media y aulas con proyector; contraste AA, objetivos táctiles ≥ 44 px, significancia comunicada con icono + palabra (no solo color), alternativa de teclado para el mapa, `prefers-reduced-motion`.

## Pending

- Experiencia previa concreta del equipo en educación y su relación con Chihuahua (para la narrativa y la página del proyecto).
- Contacto con escuela/docente y evidencia resultante.

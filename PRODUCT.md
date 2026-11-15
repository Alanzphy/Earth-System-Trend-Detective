# Product

<!-- impeccable:product-schema 1 -->


> **Estado: BORRADOR — hipótesis en discusión, no decisiones.** El enfoque (herramienta vs. método, público, Chihuahua, narrativa) sigue abierto. Las cifras de "Evidence on Hand" sí están calculadas con la API del proyecto.
> Fuente de verdad del **porqué** del proyecto. Léelo antes de cualquier trabajo de UI, demo o texto de entrega. El **qué** técnico vive en `docs/` (`product.md`, `science.md`, `architecture.md`).

## Platform

web

## Users

- **Jurado de NASA Space Apps** (decide): ve un **video de ≤ 30 s** (grabado, no en vivo) y luego quizá abre el enlace unos minutos. Tiene que entender la historia y recordarla.
- **Estudiantes de bachillerato y universidad de familias agricultoras de Chihuahua** (para quienes existe): jóvenes que conocen el campo por su familia y se mueven con soltura en la tecnología. Usan la app en clase o en el teléfono.
- **Docentes** de bachilleratos agropecuarios (CBTA) y de carreras agrícolas (p. ej. UACH): llevan la actividad al aula.

## Product Purpose

Una **herramienta** para que estudiantes de zonas agrícolas, empezando por Chihuahua, midan con datos de NASA qué está cambiando en su región (calor, lluvia, humedad del suelo, evaporación, sol), cuánto y si el cambio es significativo. La herramienta es el medio; el objetivo es la comprensión con evidencia.

**Éxito**: un estudiante elige su zona y puede explicar, con cifras y su significancia, qué cambió desde 1981 (p. ej. "+2.3 °C y 36 % menos lluvia, y no es azar").

## Mission, Vision and Impact

**Problema**: la información sobre cómo está cambiando el clima existe (décadas de datos satelitales y de modelos de NASA), pero no llega a quienes viven del campo ni a sus jóvenes de forma comprensible. Sin ella, las decisiones y la conversación sobre agua y calor se basan solo en la percepción.

**Misión**: poner los datos de NASA al alcance de estudiantes de zonas agrícolas, con una herramienta que les permita medir por sí mismos qué está cambiando en su región, cuánto y si el cambio es real.

**Visión**: que cada joven de una región agrícola pueda leer el clima de su tierra con evidencia, empezando por Chihuahua y extensible a cualquier lugar del planeta.

**Objetivo general**: una herramienta web, gratuita y sin instalación, que convierta datos de NASA en respuestas claras sobre tendencias climáticas regionales.

**Objetivos específicos**:
1. Mostrar qué variables relevantes para el campo (calor, lluvia, humedad del suelo, evaporación, sol) cambian en una región.
2. Expresar el cambio en unidades comprensibles y con su significancia estadística.
3. Permitir comparar regiones y explorar el mapa mundial de tendencias.
4. Servir de material para docentes de bachilleratos agropecuarios y carreras agrícolas.

**Impacto esperado** (meta, no resultado logrado):
- Corto plazo: estudiantes que interpretan una tendencia y distinguen un cambio significativo del azar.
- Mediano plazo: uso en aulas de CBTA/UACH en Chihuahua; conversaciones informadas con datos en familias agricultoras.
- Largo plazo: la misma herramienta aplicada a otras regiones agrícolas.

**Qué no es**: no es un pronóstico, no da recomendaciones de siembra ni de riego, no sustituye la medición en campo ni resuelve la sequía. Es una herramienta para entender y discutir con evidencia.

### English (for the project page)

- **Mission**: Put NASA Earth data in the hands of students from farming regions, so they can measure for themselves what is changing in their land, how much, and whether the change is real.
- **Vision**: Every young person in an agricultural region able to read the climate of their land with evidence — starting in Chihuahua, Mexico, and applicable anywhere on Earth.
- **What it is not**: not a forecast, not farming advice, not a replacement for field measurements. A tool to understand and discuss change with evidence.

## Positioning

La herramienta (mapa, tendencias, significancia) la puede hacer cualquiera. Lo que no se copia:

- **Enfoque local real**: zonas agrícolas de Chihuahua como punto de partida, con las variables que importan en campo y el cambio expresado en unidades comprensibles; el resto del mundo para comparar.
- **Origen en el campo**: el equipo trabajó con un rancho de la región en una plataforma de sensores IoT (nodos por predio → servidor central → gráficas). Aprendió qué variables importan en campo y por qué. Esos sensores responden "¿cómo está hoy mi parcela?", pero no "¿esto es normal o está cambiando?": para eso hacen falta décadas de datos, que es lo que aporta NASA. La experiencia es limitada; se presenta como origen, no como pericia.
- **Lugar real con datos contundentes**: Chihuahua, región agrícola clave de México, golpeada por la sequía.
- **Rigor visible**: cada afirmación lleva método, p-valor e intervalo; se distingue tendencia de azar y descripción de pronóstico.

## Operating Context

- Entrega: NASA Space Apps 2026 (fin de semana 14–15 de noviembre), reto "Be An Earth System Trend Detective". Límite: **domingo 2026-11-15, 13:00 (hora de Chihuahua)**. Video ≤ 30 s o ≤ 7 diapositivas; página del proyecto en inglés.
- Pitch en vivo del equipo: **4 minutos, 7 diapositivas**; una diapositiva puede contener el video de la demo.
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

- Experiencia del equipo en educación y su relación con Chihuahua (para la narrativa y la página del proyecto). Nombre del rancho y si autoriza mencionarlo.
- Contacto con escuela/docente (y con el rancho) y evidencia resultante.

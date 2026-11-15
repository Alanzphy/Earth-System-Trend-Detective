# Sistema visual — Earth Trend Detective

## Decisión

La app es un **atlas de investigación para estudiantes**, no una landing page. La pregunta del reto guía la pantalla: qué cambia, dónde, cuánto y con qué evidencia. Se conservan los datos y métodos; se reduce la cantidad de decisiones visibles.

En un aula o al revisar un enlace compartido, el visitante necesita leer controles con luz ambiente y distinguir datos sobre el mapa. Por eso el constructor es claro y el mapa es oscuro. No hay mapa decorativo ni segundo contexto WebGL en la portada.

## Composición

- Cabecera con identidad, navegación por anclas y enlace para saltar a la investigación.
- Introducción breve; el trabajo empieza en el primer bloque, no debajo de una portada de pantalla completa.
- Escritorio: constructor de 346 px a la izquierda; mapa, escala y selección a la derecha.
- Móvil: constructor seguido del mismo mapa. Sin ocultar variables, resultados ni comparación.
- Resultado individual: conclusión junto al gráfico; al comparar, dos regiones con la misma escala de anomalías.
- Ejemplos: superficies cálida y acuosa con cifras, p-valores y trazados derivados de los archivos reales.
- Explicación de método al final; sin información estadística avanzada obligatoria para comenzar.

## Identidad y tokens

| Rol | Token / valor |
|---|---|
| Fondo | `--paper: #f2f6f3` |
| Lectura / controles | `--surface: #ffffff` |
| Superficie secundaria | `--surface-2: #eaf0ec` |
| Texto | `--ink: #192e29`, `--ink-2: #435d54` |
| Texto secundario | `--muted: #597166` |
| Acción y selección | `--accent: #16634f` |
| Mapa | `--deep: #101e26`, `--deep-2: #1c2d35` |
| Texto sobre mapa | `--deep-ink: #f0f5f4`, `--deep-muted: #b3c4c8` |
| Foco | ocre `#bc7d26`, anillo de 3 px |

Instrument Sans para interfaz y lectura; IBM Plex Mono únicamente para medidas, unidades y cifras tabulares. Ambas autoalojadas. Títulos hasta 61 px; texto principal de 16–18 px. Espaciado base 4/8/12/16/24/32/48/64 px; radios 6/8/10/16 px. Una sombra suave solo para superposiciones.

## Datos y verdad visual

- Colores científicos independientes de la identidad: `RdBu` para temperatura y `BrBG` para agua; neutro siempre en cero.
- Gris significa que la celda no pasa la prueba de significancia. No se usa azul para «no significativo».
- Costas, fronteras y nombres quedan sobre los colores. La selección lleva un contorno ocre.
- Escala y relleno proceden del mismo manifiesto. Cambiar de variable borra la selección anterior.
- Las vistas pequeñas de los casos trazan anomalías y tendencia reales, sin inventar una curva decorativa.
- No logos, banderas ni identificadores de misión de NASA.

## Interacción y accesibilidad

Selectores nativos, objetivos de 44 px, foco visible y ayudas bajo demanda. Región B empieza vacía. La selección de extremos del mapa permite investigar sin ratón; las coordenadas permiten definir cualquier área admitida por la API.

La conclusión antecede al detalle técnico. «No significativo» nunca equivale a «no hay cambio». Los datos crudos usan un eje distinto al de las anomalías. En comparación, el rango compartido es la unión de los rangos de ambos gráficos, no una aproximación por redondeo.

El movimiento se reserva al encuadre del mapa y al indicador de carga; se respeta `prefers-reduced-motion`. El hero anterior, sus componentes duplicados y las reglas CSS acumuladas fueron eliminados.

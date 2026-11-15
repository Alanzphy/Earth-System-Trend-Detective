# Sistema visual — Earth System Trend Detective

## Idea

**"Is your town changing?"** El estudiante elige un lugar (Chihuahua primero, cualquier lugar del mundo después) y se lleva una **tarjeta de caso** hecha por él: qué cambió, cuánto y si es real. Rechaza el dashboard genérico (pestañas + gráfico + mapa) y la landing page de marketing.

La tarjeta es el objeto firma: aparece en la app, se guarda como imagen para compartir y sirve como pieza del pitch y del video.

## Composición

- **Banda nocturna** (cabecera): marca, navegación por anclas, título "Is your town changing?", selector de lugar con atajos de Chihuahua. Área personalizada por coordenadas o dibujo, bajo demanda.
- **Investigación** (se monta sobre el borde de la banda): tarjeta del caso a la izquierda; "How we know it's real" a la derecha (gráfico de anomalías + tendencia, IC 95 %, p-valor, meses, método). En móvil, una debajo de la otra.
- **Comparar**: un selector añade un segundo lugar; dos tarjetas y dos evidencias con la **misma escala** de anomalías.
- **Mapa mundial** en panel nocturno, **casos reales** (Iberia; Sahel vs Chile) y **método** en tres pasos.

## Tokens

| Rol | Valor |
|---|---|
| Banda, tarjeta, mapa | `--night #0f1a3a`, `--night-2 #1a2856`, `--night-3 #24346b` |
| Texto sobre noche | `--night-ink #f4f6ff`, `--night-muted #b4bee0` |
| Acción y cifra principal | `--sun #ff6a1a`, `--sun-2 #ffb347` |
| Estado verificado | `--sky #9fd7ff` |
| Fondo de lectura | `--paper #f3f5fb`, `--surface #fff`, `--line #d9dfee` |
| Texto | `--ink #0f1a3a`, `--ink-2 #39436a`, `--muted #59628a` |
| Foco | anillo naranja de 3 px |

**Tipografía**: Archivo variable (eje de ancho) autoalojada — expandida y negra para títulos y cifras, ancho normal para lectura. JetBrains Mono variable solo para evidencia (IC, p, n, años). Radios 8/12/22 px; una sola sombra, la de la tarjeta.

## Datos y verdad

- Cifras en lenguaje simple calculadas desde `total_change` de la API (`src/lib/evidence.ts`): °C desde el año inicial; lluvia en mm/año y % de lo normal; humedad relativa en puntos; el resto en % del promedio.
- Solo se muestra una cifra como cambio si es significativa (p < α); si no, "No clear trend" con su p-valor. Nunca se oculta el estado no significativo.
- Franjas anuales: anomalías medias por año completo, escala `RdBu` centrada en cero.
- Colores científicos del mapa (`RdBu` temperatura, `BrBG` agua) independientes de la identidad.
- Sin logos, banderas ni identificadores de misión de NASA.

## Accesibilidad y privacidad

Controles nativos (select, botones, formulario), objetivos ≥ 44 px, foco visible, significancia con icono + palabra, alternativa de teclado para el mapa, `prefers-reduced-motion`. La imagen de la tarjeta se genera en el dispositivo (canvas), no se sube, y solo admite alias o nombre de pila + escuela/club; el formulario lo advierte.

## Reglas

Sin etiquetas en mayúsculas sobre los títulos, sin bordes laterales de color, sin tarjetas anidadas, sin texto en degradado.

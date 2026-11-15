# DESIGN.md — Earth Trend Detective

> Sistema visual comprometido. Sustituye el mundo anterior (tarjetas blancas, Inter, montón de secciones iguales).
> Dirección aprobada por el equipo: **C, híbrido**; mundo: *plate de Earth Observatory*.

```yaml
world: earth-observatory-plate
mode: operate
seat: student-in-a-classroom, judge-reading-a-shared-link
ground: paper-light reading surfaces + a dark instrument surface for the data artifact
```

## La idea en una frase

El **mapa es el artefacto** y el texto es su pie de figura: una lámina de datos a sangre, sobre superficie oscura, con la lectura en papel claro debajo. Nada de tarjetas apiladas; nada de etiquetas encima de los títulos.

**Por qué este mundo:** el público (estudiantes, docentes, jueces) conoce el género *imagen de datos + pie de figura* de Earth Observatory y de los informes climáticos. Presta gramática, no marca: **no se usan logos, banderas ni identificadores de misión de NASA**.

**El riesgo, dicho en voz alta:** una lámina con pie puede leerse como "documento" y no como "herramienta". Se compensa con el constructor de casos, que es interactivo y está en el cuerpo claro.

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#FBFAF8` | Fondo de lectura |
| `--surface` | `#FFFFFF` | Superficie elevada (formularios, tarjeta de caso) |
| `--surface-2` | `#F3F1EC` | Bloques secundarios, cabeceras de tabla |
| `--line` | `#E4E0D9` | Hairline único |
| `--line-strong` | `#C9C3B8` | Bordes de control |
| `--ink` | `#17191B` | Texto principal |
| `--ink-2` | `#3B4045` | Texto secundario con contraste AA |
| `--muted` | `#6B7076` | Metadatos (nunca por debajo de 4.5:1) |
| `--accent` | `#0B6E5B` | Acción, enlaces, foco |
| `--accent-quiet` | `#E7F1ED` | Fondo de insignias |
| `--deep` | `#0C1014` | Superficie del artefacto (mapa) |
| `--deep-2` | `#131A21` | Paneles sobre el artefacto |
| `--deep-line` | `#25303A` | Hairline sobre oscuro |
| `--deep-ink` | `#E8EEF4` | Texto sobre oscuro |
| `--deep-muted` | `#93A0AE` | Metadatos sobre oscuro |

**Colores de datos (no son tokens de marca, viven en los archivos de datos):**

- Temperatura y afines: `RdBu` (azul = baja, rojo = sube).
- Agua (lluvia, humedad, evapotranspiración, suelo): `BrBG` (marrón = más seco, verde-azulado = más húmedo).
- No significativo: gris neutro opaco, **nunca** un color de la escala.
- El cero de la escala siempre es el centro neutro, en mapa y leyenda.

## Tipografía

| Rol | Fuente | Detalle |
|---|---|---|
| UI y texto | **Instrument Sans** (variable, autoalojada) | Pesos 400/500/600/700 |
| Medición y cifras | **IBM Plex Mono** (autoalojada) | Solo datos, unidades, coordenadas, p-valores; `font-variant-numeric: tabular-nums` |

Escala (px): `12.5 · 13.5 · 16 · 18 · 22 · 30 · 44 · 64`. Display máximo 64 px, tracking nunca por debajo de `-0.04em`. Medida de párrafo: 65–75 caracteres.

**Nunca**: mono como disfraz de "técnico"; serif decorativa; una segunda familia sin rol.

## Espacio, radios y elevación

- Escala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
- Más espacio encima de un título que debajo.
- Radios: `--r-sm 6`, `--r-md 10`, `--r-lg 14`; píldoras solo en controles pequeños.
- **Elevación declarada una sola vez**: borde *o* sombra, nunca los dos. Una única sombra de superposición (`--shadow-pop`), con desplazamiento y difuminado.

## Movimiento

- Una sola entrada con carácter por superficie, no una animación repetida por sección.
- `--ease-out: cubic-bezier(.16, 1, .3, 1)`, `--dur: 220ms`; el mapa vuela a la región elegida (único momento de la app).
- `prefers-reduced-motion`: saltos instantáneos, sin vuelo.

## Superficies del navegador (parte del diseño)

Selección de texto, cursor, scrollbar, anillo de foco, subrayado de enlaces y cifras tabulares: siempre tematizados desde la paleta. Son la señal más barata de que algo está construido y no ensamblado.

## Reglas duras (heredadas del *craft floor*)

- **Prohibido** un *kicker* o etiqueta en mayúsculas encima de un título. El título se sostiene solo. (`.eyebrow` desaparece en el paso 2.)
- **Prohibido** el borde lateral de color > 1 px en tarjetas, avisos o alertas. (Hoy lo tienen `.verdict`, `.trend-map__selection` y `.analysis-result__error`.)
- **Prohibidas** las tarjetas anidadas. (Hoy: leyenda del mapa dentro del panel, `fieldset` dentro de tarjeta.)
- **Prohibido** el *hero-metric* como estructura de portada: la cifra sola con etiqueta y estadísticas de adorno. La cifra del veredicto se presenta como **hallazgo con evidencia** (IC, p, n, región), no como estadística de marketing.
- Sin texto en degradado, sin cristal decorativo, sin sombras duras, sin iconos-emoji.
- Tema claro u oscuro por escena de uso, no por categoría: claro para leer y llenar; oscuro solo alrededor del artefacto de datos.

## Composición de la portada (paso 2)

- Bloque oscuro a sangre: el mapa ocupa el primer viewport, con la tarjeta del hallazgo (Iberia) encima.
- Un solo CTA primario. Sin insignias de desarrollador ("API connected" baja al pie).
- El cuerpo claro, debajo, ordena: casos → constructor → resultados.

## Accesibilidad

- Contraste ≥ 4.5:1 en texto normal, ≥ 3:1 en texto grande; sobre superficie oscura, el secundario se tiñe de la propia superficie, nunca gris genérico.
- Objetivos táctiles ≥ 44 px.
- La significancia se comunica con icono + palabra + peso, no solo color.
- El mapa necesita alternativa de teclado y lista de puntos calientes (paso 3).
- `:focus-visible` siempre visible, incluido el título que recibe el foco tras "Analyze".

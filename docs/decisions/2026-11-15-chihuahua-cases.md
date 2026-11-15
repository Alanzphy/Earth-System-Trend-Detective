# 2026-11-15: Casos de Chihuahua en lugar de las demos precalculadas

- **Estado**: aceptado
- **Fecha**: 2026-11-15
- **Autor**: equipo (con agente)

## Contexto

Las demos originales (península ibérica; Sahel occidental vs Chile central) se eligieron antes de definir la historia del proyecto. `PRODUCT.md` centra el producto en estudiantes de Chihuahua y el dato local (+2.0 a +2.4 °C y 28–39 % menos lluvia en las 8 zonas, todo significativo). Las demos tenían su propio formato (`DemoManifest`, `Demo`, `DemoPanel` en `src/contracts/`), su comando (`pipeline demos`) y su galería en la UI, que ya no encajaban.

## Opciones

1. Mantener las demos y añadir casos de Chihuahua (dos formatos para lo mismo).
2. Reemplazar las demos por **casos construidos sobre los lugares precalculados** (`pipeline regions`) y un resumen ligero.

## Decisión

Opción 2. La sección "Cases from Chihuahua" usa `src/ui/public/regions/summary.json` (cifras por variable y temperatura anual por lugar, ~56 KB) y cada caso abre la investigación con lugar, variable y comparación (`?place=&compare=&var=`). Se eliminan `DemoManifest`, `Demo`, `DemoPanel` y `DemoSummary` del contrato, el comando `pipeline demos`, `public/demos/` y los componentes de la galería. Iberia, Sahel, Chile central y Amazonía siguen disponibles como lugares en "Around the world".

## Consecuencias

- Un solo formato de datos precalculados (lugares) y un solo camino de cálculo, idéntico a `POST /trend`.
- `summary.json` no es contrato compartido: lo escribe el pipeline y lo lee solo la UI (`src/ui/src/lib/summary.ts`); si cambia, cambian ambos en el mismo PR.
- Se regeneraron `src/contracts/openapi.json` y `src/ui/src/types/contracts.gen.ts`.

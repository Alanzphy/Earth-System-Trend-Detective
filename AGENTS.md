# AGENTS.md

Reglas para agentes de IA en este repo. El proceso completo para personas está en [`docs/collaboration.md`](docs/collaboration.md).

## Proyecto

**Earth System Trend Detective** (NASA Space Apps 2026). Herramienta para que estudiantes seleccionen variables del sistema Tierra, visualicen su evolución y determinen qué cambia, dónde, cuánto y si es significativo. Enunciado: [`docs/challenge.md`](docs/challenge.md).

**Antes de cualquier trabajo de UI, demo o texto de entrega, lee [`PRODUCT.md`](PRODUCT.md)**: objetivo, historia (jóvenes de familias agricultoras de Chihuahua), público, evidencia y anti-objetivos.

## Antes de empezar

1. No hace falta issue previo ni rama por tarea: trabaja en `main` o en la rama que prefieras.
2. Lee este archivo, el `AGENTS.md` de tu área (`src/<area>/AGENTS.md`) y los docs de tu área.

## Límites

- Edita solo la carpeta y los docs del área que estés trabajando. Si necesitas cambiar otra área, coordínalo con su responsable.
- **No modifiques `src/contracts/`** salvo que el issue sea explícitamente de contrato. Esos cambios requieren un ADR.
- No crees ni edites archivos de estado de tareas; el estado vive en GitHub Issues.

## Mapa de docs

| Doc | Contenido |
|---|---|
| `docs/challenge.md` | Enunciado (no editar) |
| `docs/product.md` | Usuarios, flujo, alcance, demos |
| `docs/architecture.md` | Componentes, contratos, stack |
| `docs/data-sources.md` | Datasets, acceso, citas |
| `docs/science.md` | Métodos de tendencia y significancia |
| `docs/submission.md` · `docs/video-plan.md` · `docs/video-prompt.md` · `docs/pitch-script.md` · `docs/pitch-qa.md` | Textos de entrega; plan del video y capturas; prompt de Remotion para Claude; guion hablado del pitch; respuestas para el jurado |
| `docs/workshop-guide.md` | Guía de taller de 45 min para docentes (predecir, revelar, ¿es real?, comparar, caso) |
| `docs/validation.md` | Contraste independiente de las cifras de Chihuahua (ERA5, INECC) y qué se puede afirmar |
| `docs/glossary.md` | Definiciones simples para la UI |
| `docs/decisions/` | ADRs `YYYY-MM-DD-slug.md` (plantilla `0000-template.md`) |
| `docs/collaboration.md` | Proceso de equipo |
| `DESIGN.md` | Sistema visual de la UI (tokens, tipografía, reglas duras) |

## Al terminar

- Actualiza los docs afectados en el mismo PR.
- Crea un ADR si elegiste librería, dataset, método o stack.
- Si abres un PR, enlaza el issue cuando exista y completa el checklist de la plantilla.

## Reglas científicas

- Quita el ciclo estacional antes de evaluar tendencias en datos sub-anuales.
- No afirmes "significativo" sin prueba estadística; reporta método, periodo, región, unidades, p-valor/IC.
- Prioriza datos diarios/mensuales y cita cada dataset en `data-sources.md`.

## Despliegue y MCP (Render, Vercel)

- Usa el MCP para **consultar** (logs, estado, métricas, eventos de build) y para el alta inicial descrita en `docs/collaboration.md#despliegue`.
- No cambies configuración ni variables desde el MCP: hazlo por PR en `render.yaml` o `src/ui/vercel.json`.
- No redespliegues, borres ni suspendas servicios sin confirmación explícita del humano.
- Nunca pidas, muestres ni escribas secretos (`EARTHDATA_TOKEN`); el humano los pone en el panel.

## Convenciones

- Docs en español; código, identificadores y commits en inglés.
- Sin secretos: usa `.env` y documenta las variables en `.env.example`.

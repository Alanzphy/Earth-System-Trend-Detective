# Área: contracts

Dueño: @Alanzphy.

- Modelos Pydantic en `contracts/models.py`: fuente de verdad entre data, analysis, api y ui.
- Tras cambiar un modelo: `uv run python -m contracts.export` (raíz) y `pnpm generate:api-types` (`src/ui`). Commitea `openapi.json` y `src/ui/src/types/contracts.gen.ts`; CI falla si están desactualizados.
- Todo cambio actualiza `docs/architecture.md` y los productores/consumidores afectados en el mismo PR.

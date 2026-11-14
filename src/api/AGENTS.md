# Área: api

Dueño: @Francisco-Huerta-Trujillo · Doc: [`docs/architecture.md`](../../docs/architecture.md)

- Orquesta `data` y `analysis` y expone el catálogo de variables y los resultados a `ui`.
- No implementes lógica estadística ni de descarga; llama a esas áreas.
- Documenta cada endpoint en `architecture.md` en el mismo PR.
- Respuestas validadas contra `src/contracts/`.

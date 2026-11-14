# Área: data

Dueño: @Alanzphy · Doc: [`docs/data-sources.md`](../../docs/data-sources.md)

- Responsable de descargar, recortar por región/periodo y cachear variables.
- Produce series que cumplen el contrato de serie temporal (`src/contracts/`, descrito en `docs/architecture.md`).
- Cada fuente nueva: fila en `data-sources.md` con cita (DOI/URL), resolución, acceso y estado.
- Credenciales solo por variables de entorno documentadas en `.env.example`.
- Prioriza resolución diaria/mensual. Los datos crudos van a `data/raw/` (ignorado por git), nunca al repo.
- No hagas estadística aquí; eso es `analysis`.

# UI

Frontend React + Vite + TypeScript del proyecto. Incluye mapa MapLibre con teselas OSM y gráficos Plotly.

## Requisitos

- Node.js 20+
- pnpm

## Desarrollo local

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
Copy-Item .env.example .env
pnpm dev
```

La UI queda en `http://localhost:5173` y espera la API en `VITE_API_BASE_URL`.

## Scripts

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo. |
| `pnpm build` | Typecheck y build de producción. |
| `pnpm lint` | ESLint. |
| `pnpm test` | Vitest. |
| `pnpm generate:api-types` | Genera tipos TS desde el OpenAPI de `src/contracts/`. |

## Tipos de API

`src/types/api.ts` contiene tipos provisionales para el scaffold. Cuando se cierre el issue #4, los tipos se generan con `pnpm generate:api-types` y se reemplazan por `src/types/api.d.ts`.

## Alcance actual

Este issue (#8) solo crea el scaffold: layout, mapa, gráfico de ejemplo, cliente API y tooling. El flujo guiado, el veredicto y las demos se implementan en #9, #10 y #11.

## Despliegue

Vercel detecta Vite con `vercel.json`. Configurar `VITE_API_BASE_URL` con la URL pública de la API.

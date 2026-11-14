import { lazy, Suspense } from "react";
import { ApiStatus } from "./components/ApiStatus";
import { MapView } from "./components/MapView";

// Plotly is the heaviest dependency; load it after the first paint.
const TrendChart = lazy(() =>
  import("./components/TrendChart").then((module) => ({ default: module.TrendChart })),
);

function App() {
  return (
    <main className="app">
      <header>
        <p className="eyebrow">NASA Space Apps 2026</p>
        <h1>Earth System Trend Detective</h1>
        <p>
          Explora variables del sistema Tierra, visualiza su evolución y descubre
          si sus tendencias son significativas.
        </p>
        <ApiStatus />
      </header>

      <section className="panel">
        <h2>Región de estudio</h2>
        <MapView />
      </section>

      <section className="panel">
        <h2>Ejemplo de serie temporal</h2>
        <Suspense fallback={<p>Cargando gráfico…</p>}>
          <TrendChart />
        </Suspense>
      </section>
    </main>
  );
}

export default App;

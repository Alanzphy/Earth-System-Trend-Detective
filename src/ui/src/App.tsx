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
          Explore Earth system variables, see how they change over time, and find
          out whether their trends are significant.
        </p>
        <ApiStatus />
      </header>

      <section className="panel">
        <h2>Study region</h2>
        <MapView />
      </section>

      <section className="panel">
        <h2>Example time series</h2>
        <Suspense fallback={<p>Loading chart…</p>}>
          <TrendChart />
        </Suspense>
      </section>
    </main>
  );
}

export default App;

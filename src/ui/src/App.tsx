import { ApiStatus } from "./components/ApiStatus";
import { MapView } from "./components/MapView";
import { TrendChart } from "./components/TrendChart";

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
        <TrendChart />
      </section>
    </main>
  );
}

export default App;

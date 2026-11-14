import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

// OpenFreeMap: free vector tiles without API key, meant for production use
// (tile.openstreetmap.org discourages app traffic). Attribution comes with the style.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [-60, -15],
      zoom: 2.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="map" aria-label="Mapa de regiones" />;
}

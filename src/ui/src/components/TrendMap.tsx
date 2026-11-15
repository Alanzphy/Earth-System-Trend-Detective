import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  type ExpressionSpecification,
  type FilterSpecification,
  type GeoJSONSourceSpecification,
  type Map as MapLibreMap,
  type MapMouseEvent,
} from "maplibre-gl";
import { formatPValue } from "../lib/format";
import { colorForValue, fillColorExpression } from "../lib/palette";
import {
  cellPropertiesFromRendered,
  formatBbox,
  formatSlope,
  loadTrendMapData,
  loadTrendMapManifest,
  significanceLabel,
  toRegionSelection,
  type TrendCellCollection,
  type TrendRegionSelection,
} from "../lib/trendMaps";
import { MAP_STYLE_DARK_URL } from "../lib/mapStyle";
import type { TrendMapEntry } from "../types/contracts";
import { TrendMapLegend } from "./TrendMapLegend";

const SOURCE_ID = "trend-map-source";
const SIGNIFICANT_LAYER = "trend-map-significant";
const NOT_SIGNIFICANT_LAYER = "trend-map-not-significant";
const OUTLINE_LAYER = "trend-map-outline";
const SELECTED_LAYER = "trend-map-selected";

type Props = {
  onSelectRegion?: (region: TrendRegionSelection) => void;
  onAnalyzeRegion?: (region: TrendRegionSelection) => void;
};

export function TrendMap({ onSelectRegion, onAnalyzeRegion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [maps, setMaps] = useState<TrendMapEntry[]>([]);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ id: string; collection: TrendCellCollection } | null>(
    null,
  );
  const [selected, setSelected] = useState<TrendRegionSelection | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; region: TrendRegionSelection } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const entry = maps.find((map) => map.id === entryId) ?? null;
  // Only hand data to the map once it belongs to the selected entry.
  const data = entry && loaded?.id === entry.id ? loaded.collection : null;
  const loading = !error && (!entry || !data);
  const hotspots = useMemo(() => data
    ? data.features.filter((cell) => cell.properties.significant)
      .sort((a, b) => Math.abs(b.properties.slope) - Math.abs(a.properties.slope)).slice(0, 20)
    : [], [data]);

  // Maps can hold thousands of cells (~1.5 MB); fetch them only near the viewport.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((item) => item.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_DARK_URL,
      center: [0, 15],
      zoom: 1.3,
      minZoom: -2,
      renderWorldCopies: false,
      dragRotate: false,
      touchPitch: false,
      maxPitch: 0,
      attributionControl: { compact: true },
      // Keep development screenshots deterministic without retaining buffers in production.
      canvasContextAttributes: { preserveDrawingBuffer: import.meta.env.DEV },
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const handleLoad = () => {
      setMapLoaded(true);
      // Frame the data, not a guess: 180°W–180°E by 60°S–70°N, no padding.
      map.fitBounds(
        [
          [-180, -60],
          [180, 70],
        ],
        { padding: 24, animate: false },
      );
    };
    map.on("load", handleLoad);

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => map.resize()) : null;
    observer?.observe(containerRef.current);
    return () => {
      observer?.disconnect();
      map.off("load", handleLoad);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let active = true;
    loadTrendMapManifest()
      .then((manifest) => {
        if (active) {
          setMaps(manifest.maps);
          setEntryId(manifest.maps[0].id);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
        }
      });
    return () => {
      active = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    let active = true;
    loadTrendMapData(entry)
      .then((collection) => {
        if (active) {
          setLoaded({ id: entry.id, collection });
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
        }
      });
    return () => {
      active = false;
    };
  }, [entry]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !data || !entry) {
      return;
    }

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: data as unknown as GeoJSONSourceSpecification["data"],
      });
    }

    if (!map.getLayer(SIGNIFICANT_LAYER)) {
      map.addLayer({
        id: SIGNIFICANT_LAYER,
        type: "fill",
        source: SOURCE_ID,
        filter: ["==", ["get", "significant"], true] as FilterSpecification,
        paint: {
          // Sub-pixel cells turn into a blurred wash; square edges keep the grid legible.
          "fill-antialias": false,
          "fill-color": fillColorExpression(entry.palette, entry.legend) as ExpressionSpecification,
          "fill-opacity": 0.78,
        },
      });
    }

    if (!map.getLayer(NOT_SIGNIFICANT_LAYER)) {
      map.addLayer({
        id: NOT_SIGNIFICANT_LAYER,
        type: "fill",
        source: SOURCE_ID,
        filter: ["==", ["get", "significant"], false] as FilterSpecification,
        paint: {
          "fill-antialias": false,
          "fill-color": "#a4adb5",
          "fill-opacity": 0.25,
        },
      });
    }

    if (!map.getLayer(OUTLINE_LAYER)) {
      map.addLayer({
        id: OUTLINE_LAYER,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#ffffff",
          // A full 2.5° grid of white lines hides the colors when zoomed out.
          "line-width": 0.5,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0, 4, 0.6],
        },
      });
    }
    const water = map.getStyle().layers.find((layer) => layer.id === "water" && layer.type === "fill");
    if (water && "source" in water) {
      map.addLayer({
        id: "trend-map-coastlines", type: "line", source: water.source,
        "source-layer": water["source-layer"], filter: water.filter,
        paint: { "line-color": "#c2d3cd", "line-width": 0.8 },
      });
    }
    // Restore geographic context above the data without covering cells with land fills.
    for (const layer of map.getStyle().layers) {
      if (!layer.id.startsWith("trend-map-") && (layer.type === "symbol" || layer.type === "line")) {
        map.moveLayer(layer.id);
        if (layer.type === "symbol") {
          map.setPaintProperty(layer.id, "text-color", "#192e29");
          map.setPaintProperty(layer.id, "text-halo-color", "#eaf0ec");
          map.setPaintProperty(layer.id, "text-halo-width", 1);
        }
      }
    }
    map.addLayer({
      id: SELECTED_LAYER,
      type: "line",
      source: SOURCE_ID,
      filter: ["==", ["get", "id"], ""],
      paint: { "line-color": "#f5d48c", "line-width": 3 },
    });

    return () => {
      [SELECTED_LAYER, "trend-map-coastlines", OUTLINE_LAYER, NOT_SIGNIFICANT_LAYER, SIGNIFICANT_LAYER].forEach((layer) => {
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
    };
  }, [data, entry, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (mapLoaded && map?.getLayer(SELECTED_LAYER)) {
      map.setFilter(SELECTED_LAYER, ["==", ["get", "id"], selected?.id ?? ""]);
    }
  }, [selected, data, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !entry || !data) {
      return;
    }

    const handleClick = (event: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(event.point, {
        layers: [SIGNIFICANT_LAYER, NOT_SIGNIFICANT_LAYER],
      })[0];

      if (!feature || !feature.properties) {
        setSelected(null);
        return;
      }

      const region = toRegionSelection(cellPropertiesFromRendered(feature.properties), entry);
      setSelected(region);
      onSelectRegion?.(region);
    };

    const handleEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleLeave = () => {
      map.getCanvas().style.cursor = "";
      setHover(null);
    };

    const handleMove = (event: MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(event.point, {
        layers: [SIGNIFICANT_LAYER, NOT_SIGNIFICANT_LAYER],
      })[0];
      if (!feature || !feature.properties) {
        setHover(null);
        return;
      }
      setHover({
        x: event.point.x,
        y: event.point.y,
        region: toRegionSelection(cellPropertiesFromRendered(feature.properties), entry),
      });
    };

    map.on("click", handleClick);
    map.on("mousemove", handleMove);
    map.on("mouseenter", SIGNIFICANT_LAYER, handleEnter);
    map.on("mouseenter", NOT_SIGNIFICANT_LAYER, handleEnter);
    map.on("mouseleave", SIGNIFICANT_LAYER, handleLeave);
    map.on("mouseleave", NOT_SIGNIFICANT_LAYER, handleLeave);

    return () => {
      map.off("click", handleClick);
      map.off("mouseenter", SIGNIFICANT_LAYER, handleEnter);
      map.off("mouseenter", NOT_SIGNIFICANT_LAYER, handleEnter);
      map.off("mouseleave", SIGNIFICANT_LAYER, handleLeave);
      map.off("mouseleave", NOT_SIGNIFICANT_LAYER, handleLeave);
      map.off("mousemove", handleMove);
    };
  }, [entry, data, mapLoaded, onSelectRegion]);

  function worldView() {
    mapRef.current?.fitBounds([[-180, -60], [180, 70]], { padding: 24, animate: false });
  }

  return (
    <div className="trend-map">
      <div className="trend-map__toolbar">
        {maps.length > 1 && (
          <div className="trend-map__switcher" role="group" aria-label="Choose a trend map">
            {maps.map((map) => (
              <button key={map.id} type="button" aria-label={map.title}
                aria-pressed={map.id === entryId}
                onClick={() => {
                  setSelected(null);
                  setHover(null);
                  setError(null);
                  setEntryId(map.id);
                }}>
                {map.variable === "temperature_2m" ? "Temperature" : map.variable === "precipitation" ? "Rainfall" : map.title}
              </button>
            ))}
          </div>
        )}
        <button className="world-view" type="button" onClick={worldView}>World view</button>
      </div>

      <div className="trend-map__viewport">
        <div ref={containerRef} className="trend-map__canvas" aria-label="Trend map" />
        {loading && <p className="map-message" role="status">Loading NASA trend data…</p>}
        {error && <p className="map-message error" role="alert">Could not load the trend map: {error}</p>}
        {hover && !loading && (
          <p className="trend-map__hover num"
            style={{ left: Math.max(8, Math.min(hover.x + 12, (containerRef.current?.clientWidth ?? 300) - 240)), top: Math.max(8, hover.y - 48) }}>
            {formatSlope(hover.region.slope, hover.region.slope_units)}
            {hover.region.significant ? "" : " · not significant"}
          </p>
        )}
        {selected && entry && (
          <div className="trend-map__selection" aria-live="polite">
            <div className="selection-heading">
              <strong><span className="trend-map__swatch" aria-hidden="true"
                style={{ background: selected.significant
                  ? colorForValue(selected.slope, selected.palette, entry.legend) : "#a4adb5" }} />
                {selected.label}</strong>
              <button type="button" aria-label="Clear map selection" className="selection-close"
                onClick={() => setSelected(null)}>×</button>
            </div>
            <p className="selection-value num">{formatSlope(selected.slope, selected.slope_units)}</p>
            <p>Significance: {significanceLabel(selected.significant)} ({formatPValue(selected.p_value)})</p>
            <details><summary>Area coordinates</summary><p>{formatBbox(selected.bbox)}</p></details>
            <button className="primary-button" type="button" onClick={() => onAnalyzeRegion?.(selected)}>
              Analyze this region
            </button>
          </div>
        )}
      </div>

      {entry && <TrendMapLegend entry={entry} />}
      {entry && hotspots.length > 0 && (
        <label className="map-keyboard">
          Explore the strongest mapped trends
          <select value={hotspots.some((cell) => cell.properties.id === selected?.id) ? selected?.id ?? "" : ""}
            onChange={(event) => {
              const cell = hotspots.find((item) => item.properties.id === event.target.value);
              if (!cell) return;
              const region = toRegionSelection(cell.properties, entry);
              setSelected(region);
              onSelectRegion?.(region);
              const [west, south, east, north] = region.bbox;
              mapRef.current?.fitBounds([[west, south], [east, north]], {
                padding: 80, maxZoom: 4, animate: !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
              });
            }}>
            <option value="">Choose a cell (keyboard alternative)</option>
            {hotspots.map(({ properties: cell }) => (
              <option key={cell.id} value={cell.id}>
                {cell.label} · {formatSlope(cell.slope, entry.slope_units)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

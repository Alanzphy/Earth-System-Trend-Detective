import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type ExpressionSpecification,
  type FilterSpecification,
  type GeoJSONSourceSpecification,
  type Map as MapLibreMap,
  type MapMouseEvent,
} from "maplibre-gl";
import { colorForValue, fillColorExpression } from "../lib/palette";
import {
  cellPropertiesFromRendered,
  formatBbox,
  formatPValue,
  formatSlope,
  loadTrendMapData,
  loadTrendMapManifest,
  significanceLabel,
  toRegionSelection,
  type TrendCellCollection,
  type TrendRegionSelection,
} from "../lib/trendMaps";
import type { TrendMapEntry } from "../types/contracts";
import { TrendMapLegend } from "./TrendMapLegend";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const SOURCE_ID = "trend-map-source";
const SIGNIFICANT_LAYER = "trend-map-significant";
const NOT_SIGNIFICANT_LAYER = "trend-map-not-significant";
const OUTLINE_LAYER = "trend-map-outline";

type Props = {
  onSelectRegion?: (region: TrendRegionSelection) => void;
  onAnalyzeRegion?: (region: TrendRegionSelection) => void;
};

export function TrendMap({ onSelectRegion, onAnalyzeRegion = analyzeRegionInUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [entry, setEntry] = useState<TrendMapEntry | null>(null);
  const [data, setData] = useState<TrendCellCollection | null>(null);
  const [selected, setSelected] = useState<TrendRegionSelection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [-20, 15],
      zoom: 1.6,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const handleLoad = () => setMapLoaded(true);
    map.on("load", handleLoad);

    return () => {
      map.off("load", handleLoad);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const manifest = await loadTrendMapManifest();
        const firstMap = manifest.maps[0];
        const collection = await loadTrendMapData(firstMap);

        if (active) {
          setEntry(firstMap);
          setData(collection);
          setLoading(false);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

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
          "fill-color": fillColorExpression(
            entry.palette,
            entry.legend,
          ) as ExpressionSpecification,
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
          "fill-color": "#94a3b8",
          "fill-opacity": 0.22,
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
          "line-width": 0.6,
          "line-opacity": 0.75,
        },
      });
    }

    return () => {
      [OUTLINE_LAYER, NOT_SIGNIFICANT_LAYER, SIGNIFICANT_LAYER].forEach((layer) => {
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
    if (!map || !mapLoaded || !entry) {
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
    };

    map.on("click", handleClick);
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
    };
  }, [entry, mapLoaded, onSelectRegion]);

  return (
    <div className="trend-map">
      <div ref={containerRef} className="trend-map__canvas" aria-label="Trend map" />

      {loading && <p>Loading trend map…</p>}
      {error && (
        <p className="trend-map__error" role="alert">
          Could not load the trend map: {error}
        </p>
      )}

      {entry && <TrendMapLegend entry={entry} />}

      {selected && entry && (
        <div className="trend-map__selection" aria-live="polite">
          <strong>
            {selected.significant && (
              <span
                className="trend-map__swatch"
                aria-hidden="true"
                style={{
                  background: colorForValue(selected.slope, selected.palette, entry.legend),
                }}
              />
            )}
            {selected.label}
          </strong>
          <p>Trend: {formatSlope(selected.slope, selected.slope_units)}</p>
          <p>
            Significance: {significanceLabel(selected.significant)} (
            {formatPValue(selected.p_value)})
          </p>
          <p>Region: [{formatBbox(selected.bbox)}]</p>
          <button type="button" onClick={() => onAnalyzeRegion(selected)}>
            Analyze this region
          </button>
        </div>
      )}
    </div>
  );
}

function analyzeRegionInUrl(region: TrendRegionSelection) {
  const params = new URLSearchParams(window.location.search);
  params.set("variable", region.variable);
  params.set("bbox", region.bbox.join(","));
  params.set("start", region.period[0]);
  params.set("end", region.period[1]);
  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

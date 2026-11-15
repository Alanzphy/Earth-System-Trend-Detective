import { useEffect, useRef, useState } from "react";
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
import { MAP_STYLE_URL } from "../lib/mapStyle";
import type { TrendMapEntry } from "../types/contracts";
import { TrendMapLegend } from "./TrendMapLegend";

const SOURCE_ID = "trend-map-source";
const SIGNIFICANT_LAYER = "trend-map-significant";
const NOT_SIGNIFICANT_LAYER = "trend-map-not-significant";
const OUTLINE_LAYER = "trend-map-outline";

type Props = {
  onSelectRegion?: (region: TrendRegionSelection) => void;
  onAnalyzeRegion: (region: TrendRegionSelection) => void;
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
  const [error, setError] = useState<string | null>(null);
  const entry = maps.find((map) => map.id === entryId) ?? null;
  // Only hand data to the map once it belongs to the selected entry.
  const data = entry && loaded?.id === entry.id ? loaded.collection : null;
  const loading = !error && (!entry || !data);

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
      {maps.length > 1 && (
        <div className="trend-map__switcher" role="group" aria-label="Choose a trend map">
          {maps.map((map) => (
            <button
              key={map.id}
              type="button"
              aria-pressed={map.id === entryId}
              onClick={() => {
                setSelected(null);
                setEntryId(map.id);
              }}
            >
              {map.title}
            </button>
          ))}
        </div>
      )}

      <div ref={containerRef} className="trend-map__canvas" aria-label="Trend map" />

      {loading && <p role="status">Loading trend map…</p>}
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

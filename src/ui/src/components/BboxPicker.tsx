import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type GeoJSONSource,
  type LngLat,
  type Map as MapLibreMap,
  type MapMouseEvent,
} from "maplibre-gl";
import { bboxFromCorners } from "../lib/flow";
import { MAP_STYLE_URL } from "../lib/mapStyle";
import type { BBox } from "../types/contracts";

const SOURCE_ID = "bbox-selection";

type Props = {
  bbox: BBox | null;
  onChange: (bbox: BBox) => void;
  label: string;
};

/** Draw a box with two clicks (opposite corners). Keyboard users use the coordinate fields. */
export function BboxPicker({ bbox, onChange, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const cornerRef = useRef<LngLat | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [waitingForCorner, setWaitingForCorner] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [-20, 15],
      zoom: 1.4,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const handleLoad = () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: `${SOURCE_ID}-fill`,
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": "#2f855a", "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: `${SOURCE_ID}-line`,
        type: "line",
        source: SOURCE_ID,
        paint: { "line-color": "#22543d", "line-width": 2 },
      });
      setMapLoaded(true);
    };

    const handleClick = (event: MapMouseEvent) => {
      const corner = cornerRef.current;
      if (!corner) {
        cornerRef.current = event.lngLat;
        setWaitingForCorner(true);
        return;
      }
      cornerRef.current = null;
      setWaitingForCorner(false);
      const next = bboxFromCorners(corner, event.lngLat);
      if (next.min_lon < next.max_lon && next.min_lat < next.max_lat) {
        onChangeRef.current(next);
      }
    };

    map.on("load", handleLoad);
    map.on("click", handleClick);

    return () => {
      map.off("load", handleLoad);
      map.off("click", handleClick);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) {
      return;
    }
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!bbox) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const { min_lon, min_lat, max_lon, max_lat } = bbox;
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [min_lon, min_lat],
            [max_lon, min_lat],
            [max_lon, max_lat],
            [min_lon, max_lat],
            [min_lon, min_lat],
          ],
        ],
      },
    });
    map.fitBounds(
      [
        [min_lon, min_lat],
        [max_lon, max_lat],
      ],
      { padding: 60, maxZoom: 6, duration: 500 },
    );
  }, [bbox, mapLoaded]);

  return (
    <div className="bbox-picker">
      <div ref={containerRef} className="map" role="application" aria-label={label} />
      <p className="hint" aria-live="polite">
        {waitingForCorner
          ? "Now click the opposite corner of your box."
          : "Click two opposite corners on the map to draw a box, or type the coordinates."}
      </p>
    </div>
  );
}

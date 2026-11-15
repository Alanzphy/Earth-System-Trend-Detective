import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiStatus } from "./components/ApiStatus";
import { CaseCard } from "./components/CaseCard";
import { ComparisonScale } from "./components/ComparisonScale";
import { DemoGallery } from "./components/DemoGallery";
import { EvidencePanel } from "./components/EvidencePanel";
import { CUSTOM, PlacePicker } from "./components/PlacePicker";
import { TrendMap } from "./components/TrendMap";
import { formatRegion } from "./lib/format";
import { bboxToParam, box, parseBboxParam } from "./lib/flow";
import { loadPlaceManifest, type PlaceSummary } from "./lib/places";
import type { TrendRegionSelection } from "./lib/trendMaps";
import { usePlaceAnalyses, type Place } from "./lib/usePlaceAnalyses";
import { isVariableId, type VariableId } from "./lib/variables";
import type { BBox } from "./types/contracts";

const DEFAULT_PLACE = "delicias";

type Selection = { place: string; custom: BBox | null; compare: string; focus: VariableId };

function readUrl(): Selection {
  const params = new URLSearchParams(window.location.search);
  const custom = parseBboxParam(params.get("bbox"));
  const variable = params.get("var");
  return {
    place: custom ? CUSTOM : (params.get("place") ?? DEFAULT_PLACE),
    custom,
    compare: params.get("compare") ?? "",
    focus: isVariableId(variable) ? variable : "temperature_2m",
  };
}

function writeUrl({ place, custom, compare, focus }: Selection) {
  const params = new URLSearchParams();
  if (place === CUSTOM && custom) params.set("bbox", bboxToParam(custom));
  else params.set("place", place);
  if (compare) params.set("compare", compare);
  params.set("var", focus);
  window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
}

function toPlace(id: string, custom: BBox | null, places: PlaceSummary[] | null): Place | null {
  if (id === CUSTOM) {
    return custom ? { kind: "custom", name: `Area ${formatRegion(custom)}`, bbox: custom } : null;
  }
  const summary = places?.find((place) => place.id === id);
  return summary ? { kind: "preset", summary } : null;
}

function placeName(place: Place | null): string {
  return place ? (place.kind === "preset" ? place.summary.name : place.name) : "";
}

function App() {
  const [selection, setSelection] = useState<Selection>(readUrl);
  const [places, setPlaces] = useState<PlaceSummary[] | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadPlaceManifest()
      .then((manifest) => active && setPlaces(manifest.regions))
      .catch((error: unknown) => active && setPlacesError(error instanceof Error ? error.message : "Unknown error"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => writeUrl(selection), [selection]);

  const place = useMemo(() => toPlace(selection.place, selection.custom, places), [selection.place, selection.custom, places]);
  const other = useMemo(() => toPlace(selection.compare, null, places), [selection.compare, places]);
  const primary = usePlaceAnalyses(place);
  const second = usePlaceAnalyses(other);

  const update = useCallback((patch: Partial<Selection>) => setSelection((current) => ({ ...current, ...patch })), []);

  const investigateCell = useCallback(
    (region: TrendRegionSelection) => {
      const [west, south, east, north] = region.bbox;
      update({ place: CUSTOM, custom: box(west, south, east, north), compare: "", focus: isVariableId(region.variable) ? region.variable : "temperature_2m" });
      document.getElementById("investigate")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    },
    [update],
  );

  const comparing = Boolean(other);

  return (
    <div className="site">
      <a className="skip-link" href="#investigate">
        Skip to the investigation
      </a>
      <div className="band">
        <header className="band__bar">
          <a className="brand" href="#top">
            Earth System <b>Trend Detective</b>
          </a>
          <nav aria-label="Sections">
            <a href="#investigate">Investigate</a>
            <a href="#map">World map</a>
            <a href="#cases">Cases</a>
            <a href="#method">How it works</a>
          </nav>
        </header>
        <div className="band__intro" id="top">
          <h1>
            Is <em>your town</em> changing?
          </h1>
          <p>Pick a place and read 45 years of NASA data: what changed, how much, and whether it is real.</p>
          {placesError ? (
            <p className="error" role="alert">
              Could not load the places: {placesError}
            </p>
          ) : (
            <PlacePicker
              places={places}
              value={selection.place}
              customBbox={selection.custom}
              onSelect={(id) => update({ place: id, custom: id === CUSTOM ? selection.custom : null })}
              onCustom={(custom) => update({ place: CUSTOM, custom })}
            />
          )}
        </div>
      </div>

      <main className="app">
        <section id="investigate" className={`investigation ${comparing ? "investigation--compare" : ""}`} aria-label="Investigation">
          {!place && selection.place === CUSTOM && (
            <p className="investigation__empty">Type or draw an area above, then press “Investigate this area”.</p>
          )}
          {place && (
            <ComparisonScale key={`${selection.place}-${selection.compare}`}>
              <div className="investigation__card">
                <CaseCard name={placeName(place)} analyses={primary.analyses} focus={selection.focus} onFocus={(focus) => update({ focus })} waking={primary.waking} />
                {other && (
                  <CaseCard name={placeName(other)} analyses={second.analyses} focus={selection.focus} onFocus={(focus) => update({ focus })} waking={second.waking} />
                )}
              </div>
              <div className="investigation__evidence">
                <EvidencePanel place={placeName(place)} variable={selection.focus} state={primary.analyses[selection.focus]} />
                {other && <EvidencePanel place={placeName(other)} variable={selection.focus} state={second.analyses[selection.focus]} />}
                <label className="compare">
                  Compare with
                  <select value={selection.compare} disabled={!places} onChange={(event) => update({ compare: event.target.value })}>
                    <option value="">No comparison</option>
                    {places
                      ?.filter((item) => item.id !== selection.place)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </ComparisonScale>
          )}
        </section>

        <section id="map" className="section" aria-labelledby="map-heading">
          <div className="section__head">
            <h2 id="map-heading">Where is it changing fastest?</h2>
            <p>
              The State of Chihuahua warms about <strong>2.5 times</strong> the average of this map and sits in the{" "}
              <strong>top 4%</strong> of cells warming fastest (1981–2025). Click any cell to investigate it.
            </p>
          </div>
          <TrendMap onAnalyzeRegion={investigateCell} />
        </section>

        <section id="cases" className="section" aria-labelledby="cases-heading">
          <div className="section__head">
            <h2 id="cases-heading">Same variable, opposite directions</h2>
            <p>Real cases prepared with the same method. They work even when live analysis is asleep.</p>
          </div>
          <DemoGallery />
        </section>

        <section id="method" className="section method" aria-labelledby="method-heading">
          <h2 id="method-heading">Be a detective, not a fortune teller</h2>
          <ol className="method__steps">
            <li>
              <h3>Remove the seasons</h3>
              <p>Every month is compared with what is normal for that month, so a hot summer is not mistaken for a trend.</p>
            </li>
            <li>
              <h3>Measure the change</h3>
              <p>A robust slope gives the change per decade, with a 95% range of where the true value probably is.</p>
            </li>
            <li>
              <h3>Ask: could it be chance?</h3>
              <p>A statistical test answers it. “No clear trend” does not mean nothing changed — only that the data cannot prove it yet.</p>
            </li>
          </ol>
          <p className="method__note">We describe past change. This is not a forecast and not farming advice.</p>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Data: NASA POWER (MERRA-2, CERES). Independent student project; not affiliated with or endorsed by NASA.
        </p>
        <ApiStatus />
      </footer>
    </div>
  );
}

export default App;

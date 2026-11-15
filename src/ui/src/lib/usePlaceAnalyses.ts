import { useEffect, useState } from "react";
import type { AnalysisResponse, BBox } from "../types/contracts";
import { ApiError, postTrendWhenAwake } from "./api";
import { DEFAULT_END, DEFAULT_START } from "./flow";
import { loadPlace, type PlaceSummary } from "./places";
import { useWaking } from "./useWaking";
import { VARIABLE_ORDER, type VariableId } from "./variables";

export type Place =
  | { kind: "preset"; summary: PlaceSummary }
  | { kind: "custom"; name: string; bbox: BBox };

export type VariableState =
  | { status: "loading" }
  | { status: "done"; analysis: AnalysisResponse }
  | { status: "error"; code: string; message: string };

export type PlaceAnalyses = Record<VariableId, VariableState>;

function all(state: VariableState): PlaceAnalyses {
  return Object.fromEntries(VARIABLE_ORDER.map((id) => [id, state])) as PlaceAnalyses;
}

export function placeKey(place: Place): string {
  return place.kind === "preset"
    ? place.summary.id
    : `${place.bbox.min_lon},${place.bbox.min_lat},${place.bbox.max_lon},${place.bbox.max_lat}`;
}

/**
 * All eight variables for one place. Precomputed places load one static file (instant,
 * works while the API sleeps); custom areas run POST /trend per variable and fill in
 * as each answer arrives.
 */
export function usePlaceAnalyses(place: Place | null): { analyses: PlaceAnalyses; waking: boolean } {
  const [analyses, setAnalyses] = useState<PlaceAnalyses>(() => all({ status: "loading" }));
  const pending = VARIABLE_ORDER.some((id) => analyses[id].status === "loading");
  const waking = useWaking(pending && place?.kind === "custom");
  const key = place ? placeKey(place) : null;

  useEffect(() => {
    if (!place) {
      return;
    }
    let active = true;
    setAnalyses(all({ status: "loading" }));

    if (place.kind === "preset") {
      loadPlace(place.summary.file)
        .then((file) => {
          if (!active) return;
          setAnalyses(
            Object.fromEntries(
              VARIABLE_ORDER.map((id) => {
                const analysis = file.variables[id];
                return [
                  id,
                  analysis
                    ? { status: "done", analysis }
                    : { status: "error", code: "missing", message: "No data for this variable." },
                ];
              }),
            ) as PlaceAnalyses,
          );
        })
        .catch((error: unknown) => {
          if (active) {
            setAnalyses(all({ status: "error", code: "load_error", message: error instanceof Error ? error.message : "Could not load this place." }));
          }
        });
    } else {
      for (const id of VARIABLE_ORDER) {
        postTrendWhenAwake({ variable: id, bbox: place.bbox, start: DEFAULT_START, end: DEFAULT_END })
          .then((analysis) => {
            if (active) setAnalyses((current) => ({ ...current, [id]: { status: "done", analysis } }));
          })
          .catch((error: unknown) => {
            if (!active) return;
            const state: VariableState =
              error instanceof ApiError
                ? { status: "error", code: error.code, message: error.message }
                : { status: "error", code: "unknown", message: "Something went wrong." };
            setAnalyses((current) => ({ ...current, [id]: state }));
          });
      }
    }
    return () => {
      active = false;
    };
    // The key captures every field of the place that changes the requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { analyses, waking };
}

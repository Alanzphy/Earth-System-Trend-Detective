import { isSignificant } from "./evidence";
import type { PlaceAnalyses } from "./usePlaceAnalyses";

/** The three changes a student predicts before seeing the data. */
export const PREDICTED = ["temperature_2m", "precipitation", "soil_wetness_root"] as const;
export type PredictedId = (typeof PREDICTED)[number];

/** "unclear" is the right answer when the trend is not statistically significant. */
export type Guess = "up" | "down" | "unclear";
export type Guesses = Partial<Record<PredictedId, Guess>>;

/** Predict-first flow for the main case card: off for cases, shared links and map cells. */
export type Prediction = { stage: "off" } | { stage: "asking" | "revealed"; guesses: Guesses };
export const PREDICTION_OFF: Prediction = { stage: "off" };
export const PREDICTION_ASK: Prediction = { stage: "asking", guesses: {} };

export const QUESTIONS: Record<PredictedId, { question: string; choices: Record<Guess, string> }> = {
  temperature_2m: { question: "Heat", choices: { up: "Warmer", down: "Cooler", unclear: "No clear change" } },
  precipitation: { question: "Rain", choices: { up: "More rain", down: "Less rain", unclear: "No clear change" } },
  soil_wetness_root: { question: "Soil moisture", choices: { up: "Wetter", down: "Drier", unclear: "No clear change" } },
};

export const GUESS_ORDER: Guess[] = ["up", "down", "unclear"];

export type PredictionResult = { id: PredictedId; guess: Guess; actual: Guess; right: boolean };

/** What the data says, in the same three options the student chose from. */
export function actualChange(analyses: PlaceAnalyses, id: PredictedId): Guess | null {
  const state = analyses[id];
  if (state.status !== "done") return null;
  if (!isSignificant(state.analysis)) return "unclear";
  return state.analysis.trend.total_change > 0 ? "up" : "down";
}

/** Scores every answered question whose data loaded; null until at least one can be scored. */
export function scorePrediction(guesses: Guesses, analyses: PlaceAnalyses): { results: PredictionResult[]; right: number } | null {
  const results = PREDICTED.flatMap((id) => {
    const guess = guesses[id];
    const actual = actualChange(analyses, id);
    return guess && actual ? [{ id, guess, actual, right: guess === actual }] : [];
  });
  if (!results.length) return null;
  return { results, right: results.filter((result) => result.right).length };
}

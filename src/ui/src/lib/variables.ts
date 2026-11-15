import type { Palette } from "../types/contracts";

/** The eight NASA POWER variables, in the order a student reads them on the case card. */
export const VARIABLE_ORDER = [
  "temperature_2m",
  "precipitation",
  "soil_wetness_root",
  "evapotranspiration",
  "relative_humidity_2m",
  "solar_radiation",
  "wind_speed_10m",
  "specific_humidity_2m",
] as const;

export type VariableId = (typeof VARIABLE_ORDER)[number];

/**
 * Short labels for the case card. Names and palettes mirror src/data/data/catalog.py so
 * precomputed places render while the API sleeps; the API catalog stays the source of truth.
 */
export const VARIABLE_META: Record<VariableId, { short: string; name: string; palette: Palette }> = {
  temperature_2m: { short: "Heat", name: "Air temperature at 2 m", palette: "RdBu" },
  precipitation: { short: "Rain", name: "Precipitation", palette: "BrBG" },
  soil_wetness_root: { short: "Soil moisture", name: "Root zone soil wetness", palette: "BrBG" },
  evapotranspiration: { short: "Evaporation", name: "Evapotranspiration", palette: "BrBG" },
  relative_humidity_2m: { short: "Humidity", name: "Relative humidity at 2 m", palette: "BrBG" },
  solar_radiation: { short: "Sunlight", name: "Solar radiation at the surface", palette: "RdBu" },
  wind_speed_10m: { short: "Wind", name: "Wind speed at 10 m", palette: "RdBu" },
  specific_humidity_2m: { short: "Water vapor", name: "Specific humidity at 2 m", palette: "BrBG" },
};

export function isVariableId(value: string | null): value is VariableId {
  return value !== null && (VARIABLE_ORDER as readonly string[]).includes(value);
}

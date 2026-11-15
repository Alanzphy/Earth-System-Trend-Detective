import type { Palette, TrendMapLegend } from "../types/contracts";

type PaletteSpec = {
  negative: string;
  neutral: string;
  positive: string;
  negativeLabel: string;
  positiveLabel: string;
};

// Diverging ColorBrewer end points. RdBu for temperature-like variables,
// BrBG for water-like variables (brown = drier, blue-green = wetter).
export const PALETTES: Record<Palette, PaletteSpec> = {
  RdBu: {
    negative: "#2166ac",
    neutral: "#f7f7f7",
    positive: "#b2182b",
    negativeLabel: "Blue: decrease",
    positiveLabel: "Red: increase",
  },
  BrBG: {
    negative: "#8c510a",
    neutral: "#f5f5f5",
    positive: "#01665e",
    negativeLabel: "Brown: drier / decrease",
    positiveLabel: "Blue-green: wetter / increase",
  },
};

export type ColorStop = [value: number, color: string];

/** Stops shared by the map fill and the legend; the neutral color always sits at 0. */
export function divergingStops(palette: Palette, legend: TrendMapLegend): ColorStop[] {
  const spec = PALETTES[palette];
  return [
    [legend.min, spec.negative],
    [0, spec.neutral],
    [legend.max, spec.positive],
  ];
}

/** MapLibre `interpolate` expression over the `slope` property. */
export function fillColorExpression(palette: Palette, legend: TrendMapLegend): unknown[] {
  return [
    "interpolate",
    ["linear"],
    ["get", "slope"],
    ...divergingStops(palette, legend).flat(),
  ];
}

/** Position of a value along the legend, from 0 (min) to 1 (max), clamped. */
export function legendPosition(value: number, legend: TrendMapLegend): number {
  const ratio = (value - legend.min) / (legend.max - legend.min);
  return Math.max(0, Math.min(1, ratio));
}

/** CSS gradient for the legend bar built from the same stops as the map. */
export function legendGradient(palette: Palette, legend: TrendMapLegend): string {
  const stops = divergingStops(palette, legend).map(
    ([value, color]) => `${color} ${(legendPosition(value, legend) * 100).toFixed(2)}%`,
  );
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

/** Color for a value using linear interpolation between the diverging stops. */
export function colorForValue(
  value: number,
  palette: Palette,
  legend: TrendMapLegend,
): string {
  const stops = divergingStops(palette, legend);
  const first = stops[0];
  const last = stops[stops.length - 1];

  if (value <= first[0]) {
    return first[1];
  }
  if (value >= last[0]) {
    return last[1];
  }

  for (let index = 1; index < stops.length; index += 1) {
    const [upperValue, upperColor] = stops[index];
    if (value <= upperValue) {
      const [lowerValue, lowerColor] = stops[index - 1];
      return interpolateColor(
        lowerColor,
        upperColor,
        (value - lowerValue) / (upperValue - lowerValue),
      );
    }
  }
  return last[1];
}

function interpolateColor(start: string, end: string, amount: number): string {
  const from = hexToRgb(start);
  const to = hexToRgb(end);
  const channels = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * amount),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

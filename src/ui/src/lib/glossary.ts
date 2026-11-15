// English definitions for the UI. Source of truth: docs/glossary.md (keep in sync).
export const GLOSSARY = {
  trend: {
    term: "Trend",
    definition: "A sustained change in one direction over time.",
  },
  anomaly: {
    term: "Anomaly",
    definition: "The difference between a value and what is normal for that time of year.",
  },
  seasonalCycle: {
    term: "Seasonal cycle",
    definition: "The rises and falls that repeat every year (summer/winter).",
  },
  significance: {
    term: "Significance",
    definition: "How confident we are that the trend is not just chance.",
  },
  pValue: {
    term: "p-value",
    definition: "The probability of seeing a trend like this if there were really no trend.",
  },
  trendSlope: {
    term: "Trend slope",
    definition: "How much a variable changes per unit of time.",
  },
  confidenceInterval: {
    term: "Confidence interval",
    definition: "A range of values where the true value is likely to be.",
  },
  theilSen: {
    term: "Theil–Sen slope",
    definition:
      "A robust way to measure the slope: the median of the slopes between all pairs of points, so a few extreme values do not change it much.",
  },
  mannKendall: {
    term: "Mann–Kendall test",
    definition:
      "A test that checks whether values tend to go up or down over time, without assuming a straight line.",
  },
  pixel: {
    term: "Pixel",
    definition: "A small square in a map or image; here it represents a small area of Earth.",
  },
  fdr: {
    term: "False discovery rate (FDR)",
    definition: "A correction that reduces the risk of calling many results significant by chance.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;

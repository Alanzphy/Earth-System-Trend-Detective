export type HealthResponse = {
  status: string;
};

export type TimeSeriesPoint = {
  time: string;
  value: number | null;
};

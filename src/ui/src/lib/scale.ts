/**
 * Symmetric, quantised y-domain around zero so two panels of the same variable
 * are directly comparable even though they load independently: each rounds up
 * to the same ladder step, so similar magnitudes land on the same scale.
 */
const LADDER = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];

export function symmetricDomain(values: readonly (number | null)[]): [number, number] {
  let peak = 0;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) {
      continue;
    }
    peak = Math.max(peak, Math.abs(value));
  }
  if (peak === 0) {
    return [-1, 1];
  }
  const step = LADDER.find((candidate) => peak <= candidate) ?? LADDER[LADDER.length - 1];
  return [-step, step];
}

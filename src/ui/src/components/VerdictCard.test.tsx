import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeAnalysis } from "../test/fixtures";
import { VerdictCard } from "./VerdictCard";

// "significant" that is not preceded by "not" (e.g. "Statistically significant").
const CLAIMS_SIGNIFICANCE = /(?<!not )statistically significant/i;

function cardText() {
  return screen.getByRole("article", { name: "Verdict" }).textContent ?? "";
}

describe("VerdictCard", () => {
  it("reports a significant increase with slope, CI, total change and context", () => {
    render(<VerdictCard analysis={makeAnalysis()} />);

    expect(screen.getByRole("heading", { name: /Increasing/ })).toBeInTheDocument();
    expect(screen.getByText(/Statistically significant · p < 0\.001/)).toBeInTheDocument();
    expect(screen.getByText("+0.260")).toBeInTheDocument();
    expect(screen.getByText(/95% CI 0\.20 → 0\.32/)).toBeInTheDocument();
    expect(screen.getByText(/\+1\.17 °C in 45 years/)).toBeInTheDocument();
    expect(screen.getByText(/1981-01 → 2025-12/)).toBeInTheDocument();
    expect(screen.getByText("10°W to 3°E, 36°N to 44°N")).toBeInTheDocument();
    expect(screen.getByText(/540 months/)).toBeInTheDocument();
    expect(screen.getByText(/Theil–Sen slope \+ Mann–Kendall/)).toBeInTheDocument();
  });

  it("never claims significance when significant=false", () => {
    render(
      <VerdictCard
        analysis={makeAnalysis(
          { significant: false, p_value: 0.32, direction: "no trend", slope_per_decade: 0.01 },
          "Precipitation rose slightly, by about 0.01 mm/day per decade (1981–2025), but we cannot rule out chance (p = 0.32). A longer period might reveal a trend.",
        )}
      />,
    );

    expect(screen.getByRole("heading", { name: /No clear trend/ })).toBeInTheDocument();
    expect(screen.getByText(/Not statistically significant · p/)).toBeInTheDocument();
    expect(cardText()).not.toMatch(CLAIMS_SIGNIFICANCE);
    expect(cardText()).not.toMatch(/Increasing|Decreasing/);
  });

  it("does not trust significant=true when p is not below alpha", () => {
    render(<VerdictCard analysis={makeAnalysis({ significant: true, p_value: 0.05 })} />);

    expect(screen.getByRole("heading", { name: /No clear trend/ })).toBeInTheDocument();
    expect(screen.getByText(/Not statistically significant · p/)).toBeInTheDocument();
  });

  it("explains technical terms with accessible glossary toggletips", () => {
    render(<VerdictCard analysis={makeAnalysis()} />);

    const pValue = screen.getByRole("button", { name: /p-value/ });
    expect(pValue).toHaveAccessibleDescription(/probability of seeing a trend like this/);
    expect(pValue).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(pValue);
    expect(pValue).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/probability of seeing a trend like this/)).toBeVisible();

    fireEvent.keyDown(pValue, { key: "Escape" });
    expect(pValue).toHaveAttribute("aria-expanded", "false");

    for (const name of [/confidence interval/i, /anomalies/i, /significance/i, /theil–sen/i]) {
      expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
    }
  });
});

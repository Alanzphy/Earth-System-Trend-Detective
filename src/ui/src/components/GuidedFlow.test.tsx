import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_FLOW, type FlowState } from "../lib/flow";
import { VARIABLES } from "../test/fixtures";
import { GuidedFlow } from "./GuidedFlow";

vi.mock("./BboxPicker", () => ({
  BboxPicker: () => <div>Map</div>,
}));

function Harness({ onAnalyze = vi.fn(), initial = EMPTY_FLOW }) {
  const [flow, setFlow] = useState<FlowState>(initial);
  return (
    <>
      <GuidedFlow
        catalog={{ status: "ready", variables: VARIABLES }}
        flow={flow}
        onChange={setFlow}
        onAnalyze={onAnalyze}
      />
      <output data-testid="state">{JSON.stringify(flow)}</output>
    </>
  );
}

function state(): FlowState {
  return JSON.parse(screen.getByTestId("state").textContent ?? "{}");
}

describe("GuidedFlow", () => {
  it("filters variables by topic and shows units and description", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Water/ }));

    expect(screen.getByRole("option", { name: /Precipitation/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Air temperature/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Earth variable" }), {
      target: { value: "precipitation" },
    });
    expect(screen.getByText("Water falling as rain or snow.")).toBeInTheDocument();
  });

  it("walks through variable, region and period, then analyzes", () => {
    const onAnalyze = vi.fn();
    render(<Harness onAnalyze={onAnalyze} />);

    fireEvent.click(screen.getByRole("button", { name: /Analyze/ }));
    expect(onAnalyze).not.toHaveBeenCalled();
    expect(screen.getByText("Choose a variable.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Energy/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Earth variable" }), {
      target: { value: "solar_radiation" },
    });
    // Solar radiation starts in 1984: the period is clamped to its availability.
    expect(state().start).toBe("1984-01");

    fireEvent.change(screen.getByRole("combobox", { name: "Region: choose a place" }), {
      target: { value: "iberia" },
    });
    expect(state().bbox).toEqual({ min_lon: -10, min_lat: 36, max_lon: 3, max_lat: 44 });

    fireEvent.change(screen.getByLabelText("End month"), { target: { value: "2020-12" } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze" }));

    expect(onAnalyze).toHaveBeenCalledTimes(1);
    expect(state()).toMatchObject({ variable: "solar_radiation", start: "1984-01", end: "2020-12" });
  });

  it("edits the box with the coordinate fields and warns about tiny boxes", () => {
    render(<Harness />);

    fireEvent.change(screen.getByRole("combobox", { name: "Region: choose a place" }), {
      target: { value: "madrid" },
    });
    // Presets contain valid decimal coordinates (39.4°), not only quarter degrees.
    expect(screen.getByRole("form", { name: "Guided analysis" })).toBeValid();
    fireEvent.change(screen.getByLabelText("East (longitude)"), { target: { value: "-4" } });

    expect(state().bbox).toEqual({ min_lon: -4.75, min_lat: 39.4, max_lon: -4, max_lat: 41.4 });
    expect(screen.getByText(/smaller than 2° × 2°/)).toBeInTheDocument();
  });

  it("adds and removes a second region to compare", () => {
    render(<Harness initial={{ ...EMPTY_FLOW, variable: "precipitation" }} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Region: choose a place" }), {
      target: { value: "western-sahel" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Compare with another region" }));

    expect(screen.getByRole("group", { name: "Region A" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Region B" })).toBeInTheDocument();
    expect(state().compare).toBeNull();
    fireEvent.change(screen.getByRole("combobox", { name: "Region B: choose a place" }), {
      target: { value: "central-chile" },
    });
    expect(state().compare).toEqual({ min_lon: -73, min_lat: -38, max_lon: -70, max_lat: -30 });
    expect(screen.getByRole("button", { name: "Analyze both regions" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove the second region" }));
    expect(state().compare).toBeNull();
  });
});

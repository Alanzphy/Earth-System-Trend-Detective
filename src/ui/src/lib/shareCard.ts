import { annualAnomalies, isSignificant, plainChange } from "./evidence";
import { formatPValue } from "./format";
import { colorForValue } from "./palette";
import type { PlaceAnalyses } from "./usePlaceAnalyses";
import { VARIABLE_META, VARIABLE_ORDER, type VariableId } from "./variables";

type CaseImage = {
  name: string;
  analyses: PlaceAnalyses;
  focus: VariableId;
  alias: string;
  club: string;
  /** The student's predictions before looking, when they made them. */
  prediction?: { right: number; total: number };
};

const W = 1080;
const H = 1350;
const NIGHT = "#0f1a3a";
const SUN = "#ffb347";
const SKY = "#9fd7ff";
const DISPLAY = '"Archivo Variable", Archivo, system-ui, sans-serif';
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace';

function fit(context: CanvasRenderingContext2D, text: string, weight: number, start: number, maxWidth: number): number {
  let size = start;
  do {
    context.font = `${weight} ${size}px ${DISPLAY}`;
    size -= 4;
  } while (context.measureText(text).width > maxWidth && size > 24);
  return size + 4;
}

/** Draws the case card as a 4:5 image and shares or downloads it. Nothing leaves the device. */
export async function renderCaseImage({ name, analyses, focus, alias, club, prediction }: CaseImage): Promise<Blob> {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas is not available");

  const gradient = c.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#1d2e6b");
  gradient.addColorStop(0.6, NIGHT);
  c.fillStyle = gradient;
  c.fillRect(0, 0, W, H);

  if (prediction) {
    c.fillStyle = SUN;
    c.font = `600 26px ${MONO}`;
    c.fillText(`Predicted ${prediction.right} of ${prediction.total} before looking`, 72, 84);
  }

  c.fillStyle = "#fff";
  fit(c, name, 800, 72, W - 144);
  c.fillText(name, 72, 160);

  const heat = analyses.temperature_2m;
  if (heat.status === "done") {
    const years = annualAnomalies(heat.analysis);
    const max = Math.max(...years.map((year) => Math.abs(year.value)), 0.001);
    const width = (W - 144) / years.length;
    years.forEach((year, index) => {
      c.fillStyle = colorForValue(year.value, "RdBu", { min: -max, max });
      c.fillRect(72 + index * width, 230, width + 1, 150);
    });
    c.fillStyle = "#aab6dd";
    c.font = `500 24px ${MONO}`;
    c.fillText(years[0]?.year ?? "", 72, 418);
    c.textAlign = "right";
    c.fillText(years[years.length - 1]?.year ?? "", W - 72, 418);
    c.textAlign = "left";
  }

  const focused = analyses[focus];
  if (focused.status === "done") {
    const significant = isSignificant(focused.analysis);
    const change = plainChange(focus, focused.analysis);
    c.fillStyle = "#cfd6f3";
    c.font = `500 30px ${DISPLAY}`;
    c.fillText(VARIABLE_META[focus].name, 72, 500);
    c.fillStyle = SUN;
    fit(c, significant ? change.figure : "No clear trend", 900, 168, W - 144);
    c.fillText(significant ? change.figure : "No clear trend", 66, 650);
    c.fillStyle = "#cfd6f3";
    c.font = `500 32px ${DISPLAY}`;
    c.fillText(significant ? change.caption : "The change could be chance", 72, 708);
    c.fillStyle = significant ? SKY : "#cfd6f3";
    c.font = `600 28px ${DISPLAY}`;
    c.fillText(
      `${significant ? "Statistically significant" : "Not significant"} · ${formatPValue(focused.analysis.trend.p_value)}`,
      72,
      764,
    );
  }

  const others = VARIABLE_ORDER.filter((id) => id !== focus).slice(0, 6);
  others.forEach((id, index) => {
    const x = 72 + (index % 2) * 474;
    const y = 830 + Math.floor(index / 2) * 128;
    c.fillStyle = "rgba(255,255,255,0.07)";
    c.beginPath();
    c.roundRect(x, y, 450, 108, 20);
    c.fill();
    const state = analyses[id];
    c.fillStyle = "#aab6dd";
    c.font = `500 26px ${DISPLAY}`;
    c.fillText(VARIABLE_META[id].short, x + 24, y + 42);
    c.fillStyle = "#fff";
    c.font = `800 36px ${DISPLAY}`;
    const value =
      state.status === "done"
        ? isSignificant(state.analysis)
          ? plainChange(id, state.analysis).figure
          : "No clear trend"
        : "—";
    c.fillText(value, x + 24, y + 88);
  });

  c.fillStyle = "#aab6dd";
  c.font = `500 26px ${DISPLAY}`;
  const by = [alias && `Investigated by ${alias}`, club].filter(Boolean).join(" · ");
  if (by) c.fillText(by, 72, H - 104);
  c.fillStyle = "#fff";
  c.font = `800 28px ${DISPLAY}`;
  c.fillText("Earth System Trend Detective", 72, H - 60);
  c.fillStyle = "#aab6dd";
  c.font = `500 22px ${DISPLAY}`;
  c.textAlign = "right";
  c.fillText("NASA POWER data · not a forecast", W - 72, H - 60);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image"))), "image/png"),
  );
}

export async function saveCaseImage(data: CaseImage): Promise<void> {
  const blob = await renderCaseImage(data);
  const file = new File([blob], `case-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `My case: ${data.name}` });
      return;
    } catch {
      // Cancelled or blocked: fall back to a download.
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

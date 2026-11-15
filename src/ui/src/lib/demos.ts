import type { Demo, DemoManifest } from "../types/contracts";
import { isRecord } from "./guards";
import { assetUrl } from "./trendMaps";

const DEMOS_DIR = "demos";

// Static files from public/demos/ so demos work while the API sleeps.
export async function loadDemoManifest(baseUrl = import.meta.env.BASE_URL): Promise<DemoManifest> {
  const response = await fetch(assetUrl(`${DEMOS_DIR}/manifest.json`, baseUrl));
  if (!response.ok) {
    throw new Error(`Could not load the demo list (${response.status})`);
  }
  const value: unknown = await response.json();
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.demos)) {
    throw new Error("Invalid demo manifest: expected version 1 with a demos list");
  }
  return value as DemoManifest;
}

export async function loadDemo(file: string, baseUrl = import.meta.env.BASE_URL): Promise<Demo> {
  const response = await fetch(assetUrl(`${DEMOS_DIR}/${file}`, baseUrl));
  if (!response.ok) {
    throw new Error(`Could not load the demo (${response.status})`);
  }
  const value: unknown = await response.json();
  if (
    !isRecord(value) ||
    !Array.isArray(value.panels) ||
    value.panels.length < 1 ||
    value.panels.length > 2
  ) {
    throw new Error("Invalid demo file: expected one or two panels");
  }
  return value as Demo;
}

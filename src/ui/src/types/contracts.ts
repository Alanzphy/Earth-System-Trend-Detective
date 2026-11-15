// Friendly aliases for the generated contract types (src/contracts is the source of truth).
import type { components } from "./contracts.gen";

type Schemas = components["schemas"];

export type BBox = Schemas["BBox"];
export type Variable = Schemas["Variable"];
export type VariableCategory = Variable["category"];
export type Palette = Variable["palette"];
export type CatalogResponse = Schemas["CatalogResponse"];
export type TimeSeries = Schemas["TimeSeries"];
export type TrendResult = Schemas["TrendResult"];
export type TrendDirection = TrendResult["direction"];
export type AnalysisResponse = Schemas["AnalysisResponse"];
export type TrendRequest = Schemas["TrendRequest"];
export type ErrorResponse = Schemas["ErrorResponse"];
export type TrendMapManifest = Schemas["TrendMapManifest"];
export type TrendMapEntry = Schemas["TrendMapEntry"];
export type TrendMapLegend = Schemas["TrendMapLegend"];
export type TrendCellProperties = Schemas["TrendCellProperties"];

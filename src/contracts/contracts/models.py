"""Shared schemas between data, analysis, api and ui.

Single source of truth: TypeScript types are generated from these models
(`uv run python -m contracts.export` then `pnpm generate:api-types`).
"""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

YearMonth = Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$", examples=["1981-01"])]

Resolution = Literal["monthly"]
TrendDirection = Literal["increasing", "decreasing", "no trend"]
VariableCategory = Literal["temperature", "water", "air", "energy", "soil"]
# Diverging palette used to color trends of a variable (ColorBrewer names).
Palette = Literal["RdBu", "BrBG"]


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class BBox(Model):
    """Geographic box in degrees, WGS84."""

    min_lon: float = Field(ge=-180, le=180)
    min_lat: float = Field(ge=-90, le=90)
    max_lon: float = Field(ge=-180, le=180)
    max_lat: float = Field(ge=-90, le=90)

    @model_validator(mode="after")
    def _ordered(self) -> BBox:
        if self.min_lon >= self.max_lon or self.min_lat >= self.max_lat:
            raise ValueError("bbox min values must be lower than max values")
        return self


class Variable(Model):
    id: str = Field(examples=["temperature_2m"])
    name: str = Field(examples=["Air temperature at 2 m"])
    units: str = Field(examples=["°C"])
    description: str = Field(description="Plain-language definition for students.")
    category: VariableCategory
    palette: Palette = Field(description="RdBu for temperature-like, BrBG for water-like.")
    source: str = Field(examples=["NASA POWER"])
    source_parameter: str = Field(examples=["T2M"])
    available_from: YearMonth
    available_to: YearMonth


class CatalogResponse(Model):
    variables: list[Variable]


class TimeSeries(Model):
    """Area-averaged monthly series (cosine-of-latitude weighted)."""

    variable: str
    units: str
    bbox: BBox
    resolution: Resolution = "monthly"
    time: list[YearMonth]
    values: list[float | None] = Field(description="null where the source has no data.")
    source: str
    grid_points: int = Field(ge=1, description="Source grid points averaged into the series.")

    @model_validator(mode="after")
    def _same_length(self) -> TimeSeries:
        if len(self.time) != len(self.values):
            raise ValueError("time and values must have the same length")
        return self


class TrendResult(Model):
    method: str = Field(examples=["Theil–Sen slope + Mann–Kendall (Hamed–Rao)"])
    deseasonalized: bool
    slope_per_decade: float
    slope_units: str = Field(examples=["°C/decade"])
    ci_low: float = Field(description="Lower bound of the 95% CI of the slope, per decade.")
    ci_high: float = Field(description="Upper bound of the 95% CI of the slope, per decade.")
    p_value: float = Field(ge=0, le=1)
    alpha: float = Field(gt=0, lt=1)
    significant: bool
    direction: TrendDirection
    total_change: float = Field(description="slope_per_decade × period length in decades.")
    n: int = Field(ge=0, description="Months with data used in the test.")
    period_start: YearMonth
    period_end: YearMonth


class AnalysisResponse(Model):
    """Everything the UI needs to plot raw, deseasonalized and trend lines."""

    series: TimeSeries
    anomalies: list[float | None] = Field(description="Values minus the monthly climatology.")
    trend_line: list[float | None] = Field(description="Fitted trend over the anomalies.")
    trend: TrendResult
    verdict: str = Field(description="Plain-language summary for students.")


class TrendRequest(Model):
    variable: str
    bbox: BBox
    start: YearMonth
    end: YearMonth

    @model_validator(mode="after")
    def _period(self) -> TrendRequest:
        if self.start >= self.end:
            raise ValueError("start must be before end")
        return self


class ErrorDetail(Model):
    code: str
    message: str


class ErrorResponse(Model):
    error: ErrorDetail


# ---- Precomputed demos (static files under src/ui/public/demos/) ----


class DemoPanel(Model):
    label: str = Field(examples=["Western Sahel"])
    analysis: AnalysisResponse


class Demo(Model):
    id: str
    title: str
    summary: str
    panels: list[DemoPanel] = Field(min_length=1, max_length=2)


class DemoSummary(Model):
    id: str
    title: str
    summary: str
    file: str = Field(description="Path relative to the demos folder.")


class DemoManifest(Model):
    version: Literal[1] = 1
    generated_at: str
    demos: list[DemoSummary]


# ---- Precomputed trend maps (static files under src/ui/public/trend-maps/) ----


class TrendMapLegend(Model):
    min: float
    max: float

    @model_validator(mode="after")
    def _spans_zero(self) -> TrendMapLegend:
        if not self.min < 0 < self.max:
            raise ValueError("legend must span zero (min < 0 < max)")
        return self


class TrendMapEntry(Model):
    id: str
    title: str
    variable: str
    units: str
    slope_units: str
    period: tuple[YearMonth, YearMonth]
    palette: Palette
    cell_size_deg: float = Field(gt=0)
    file: str
    legend: TrendMapLegend
    alpha: float = Field(gt=0, lt=1)
    fdr: bool = Field(description="Benjamini–Hochberg correction applied across cells.")
    is_sample: bool = False


class TrendMapManifest(Model):
    version: Literal[2] = 2
    generated_at: str
    maps: list[TrendMapEntry] = Field(min_length=1)


class TrendCellProperties(Model):
    """Properties of each GeoJSON polygon feature in a trend-map file."""

    id: str
    label: str
    slope: float = Field(description="Trend per decade in the entry's slope_units.")
    p_value: float = Field(ge=0, le=1)
    significant: bool = Field(description="After FDR correction when the entry says so.")
    bbox: tuple[float, float, float, float]

    @field_validator("bbox")
    @classmethod
    def _bbox_order(cls, value: tuple[float, float, float, float]) -> tuple[float, ...]:
        BBox(min_lon=value[0], min_lat=value[1], max_lon=value[2], max_lat=value[3])
        return value


ALL_MODELS: tuple[type[BaseModel], ...] = (
    BBox,
    Variable,
    CatalogResponse,
    TimeSeries,
    TrendResult,
    AnalysisResponse,
    TrendRequest,
    ErrorResponse,
    DemoPanel,
    Demo,
    DemoSummary,
    DemoManifest,
    TrendMapLegend,
    TrendMapEntry,
    TrendMapManifest,
    TrendCellProperties,
)

"""Catalog of the MVP variables, all served by NASA POWER (see docs/data-sources.md)."""

from __future__ import annotations

from dataclasses import dataclass

from contracts import CatalogResponse, Variable
from data.errors import UnknownVariableError

SOURCE = "NASA POWER"
DATA_END = "2025-12"


@dataclass(frozen=True)
class CatalogEntry:
    variable: Variable
    # Source values are divided by this to get `variable.units`.
    divisor: float = 1.0


def _entry(
    id: str,
    name: str,
    units: str,
    description: str,
    category: str,
    palette: str,
    parameter: str,
    *,
    available_from: str = "1981-01",
    divisor: float = 1.0,
) -> CatalogEntry:
    return CatalogEntry(
        variable=Variable(
            id=id,
            name=name,
            units=units,
            description=description,
            category=category,
            palette=palette,
            source=SOURCE,
            source_parameter=parameter,
            available_from=available_from,
            available_to=DATA_END,
        ),
        divisor=divisor,
    )


_ENTRIES: tuple[CatalogEntry, ...] = (
    _entry(
        "temperature_2m",
        "Air temperature at 2 m",
        "°C",
        "How warm the air is about 2 meters above the ground, where people live.",
        "temperature",
        "RdBu",
        "T2M",
    ),
    _entry(
        "precipitation",
        "Precipitation",
        "mm/day",
        "How much rain and snow falls, as the average depth of water per day.",
        "water",
        "BrBG",
        "PRECTOTCORR",
    ),
    _entry(
        "relative_humidity_2m",
        "Relative humidity at 2 m",
        "%",
        "How close the air is to being saturated with water vapor (100% means fully saturated).",
        "water",
        "BrBG",
        "RH2M",
    ),
    _entry(
        "specific_humidity_2m",
        "Specific humidity at 2 m",
        "g/kg",
        "How many grams of water vapor there are in each kilogram of air.",
        "water",
        "BrBG",
        "QV2M",
    ),
    _entry(
        "wind_speed_10m",
        "Wind speed at 10 m",
        "m/s",
        "How fast the wind blows 10 meters above the ground.",
        "air",
        "RdBu",
        "WS10M",
    ),
    _entry(
        "solar_radiation",
        "Solar radiation at the surface",
        "kWh/m²/day",
        "How much energy from sunlight reaches the ground each day, including cloudy days.",
        "energy",
        "RdBu",
        "ALLSKY_SFC_SW_DWN",
        available_from="1984-01",
        divisor=3.6,  # MJ/m²/day -> kWh/m²/day
    ),
    _entry(
        "evapotranspiration",
        "Evapotranspiration",
        "mm/day",
        "How much water goes from the soil and plants back into the air each day.",
        "water",
        "BrBG",
        # Land evaporation in mm/day. EVPTRNS (an energy flux) is 0 in most months over
        # dry regions such as northern Mexico, which made the trend meaningless there.
        "EVLAND",
    ),
    _entry(
        "soil_wetness_root",
        "Root zone soil wetness",
        "fraction 0–1",
        "How wet the soil is where plant roots grow: 0 is completely dry, 1 is saturated.",
        "soil",
        "BrBG",
        "GWETROOT",
    ),
)

_BY_ID: dict[str, CatalogEntry] = {e.variable.id: e for e in _ENTRIES}


def get_catalog() -> CatalogResponse:
    return CatalogResponse(variables=[e.variable for e in _ENTRIES])


def get_entry(variable: str) -> CatalogEntry:
    try:
        return _BY_ID[variable]
    except KeyError:
        raise UnknownVariableError(variable) from None

"""Generate static demos and trend maps for the UI.

Usage (repo root):
  uv run python -m pipeline demos
  uv run python -m pipeline trend-maps [variable ...]
  uv run python -m pipeline regions
"""

from __future__ import annotations

import argparse
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[2] / "ui" / "public"
DEFAULT_MAP_VARIABLES = ["temperature_2m", "precipitation"]


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m pipeline")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("demos", help="write src/ui/public/demos/")
    sub.add_parser("regions", help="write src/ui/public/regions/")
    maps = sub.add_parser("trend-maps", help="write src/ui/public/trend-maps/")
    maps.add_argument("variables", nargs="*", default=DEFAULT_MAP_VARIABLES)
    args = parser.parse_args()

    if args.command == "demos":
        from pipeline.demos import write_demos

        write_demos(PUBLIC / "demos")
    elif args.command == "regions":
        from pipeline.regions import write_regions

        write_regions(PUBLIC / "regions")
    else:
        from pipeline.trend_maps import write_trend_maps

        write_trend_maps(args.variables, PUBLIC / "trend-maps")


if __name__ == "__main__":
    main()

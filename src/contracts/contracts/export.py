"""Export the contract models as an OpenAPI document for TypeScript generation.

Usage (repo root): uv run python -m contracts.export
Writes src/contracts/openapi.json; the UI turns it into types with
`pnpm generate:api-types`. CI fails if either file is stale.
"""

from __future__ import annotations

import json
from pathlib import Path

from pydantic.json_schema import models_json_schema

from contracts.models import ALL_MODELS

OUTPUT = Path(__file__).resolve().parent.parent / "openapi.json"


def build_document() -> dict[str, object]:
    _, schema = models_json_schema(
        [(model, "validation") for model in ALL_MODELS],
        ref_template="#/components/schemas/{model}",
    )
    return {
        "openapi": "3.1.0",
        "info": {"title": "Earth System Trend Detective contracts", "version": "1.0.0"},
        "paths": {},
        "components": {"schemas": schema.get("$defs", {})},
    }


def main() -> None:
    OUTPUT.write_text(json.dumps(build_document(), indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    main()

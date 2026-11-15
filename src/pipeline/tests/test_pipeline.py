import numpy as np

from contracts import BBox
from pipeline.fdr import benjamini_hochberg
from pipeline.trend_maps import _legend_limit, cell_series, tiles

TILE = BBox(min_lon=0, min_lat=0, max_lon=10, max_lat=10)


def test_bh_matches_hand_computed_example() -> None:
    # m=5, alpha=0.05 → thresholds .01 .02 .03 .04 .05. Sorted p: .001 .012 .03 .04 .2.
    # Largest passing rank is 4 (.04 ≤ .04), so the 4 smallest are rejected, even .03 and .04
    # that a step-by-step reading might miss.
    p = np.array([0.04, 0.001, 0.03, 0.2, 0.012])
    assert benjamini_hochberg(p, 0.05).tolist() == [True, True, True, False, True]


def test_bh_under_null_rarely_rejects() -> None:
    rng = np.random.default_rng(0)
    rejections = sum(benjamini_hochberg(rng.uniform(size=2000), 0.05).any() for _ in range(50))
    assert rejections <= 5


def test_cells_use_half_open_tile_bounds_and_latitude_weights() -> None:
    lons = np.array([0.0, 0.625, 0.0, 10.0])  # last point belongs to the next tile
    lats = np.array([0.0, 2.0, 60.0, 0.0])
    values = np.array([[1.0], [3.0], [5.0], [99.0]])

    cells = {bbox: (mean, n) for bbox, mean, n in cell_series(lons, lats, values, TILE)}

    first = cells[(0.0, 0.0, 2.5, 2.5)]
    w0, w1 = np.cos(0.0), np.cos(np.radians(2.0))
    assert first[1] == 2
    assert np.isclose(first[0][0], (1.0 * w0 + 3.0 * w1) / (w0 + w1))
    assert all(bbox[2] <= 10 for bbox in cells)


def test_missing_months_stay_missing() -> None:
    lons, lats = np.array([1.0]), np.array([1.0])
    values = np.array([[np.nan, 2.0]])
    (_, mean, _), = list(cell_series(lons, lats, values, TILE))
    assert np.isnan(mean[0]) and mean[1] == 2.0


def test_tiles_cover_domain_without_overlap() -> None:
    boxes = list(tiles())
    assert len(boxes) == 13 * 36
    assert len({(b.min_lon, b.min_lat) for b in boxes}) == len(boxes)


def test_legend_limit_is_symmetric_and_rounded() -> None:
    assert _legend_limit(np.array([-0.31, 0.12, 0.27, 0.05])) == 0.31


def test_city_box_is_2deg_centred_and_snapped() -> None:
    from pipeline.regions import city_box

    box = city_box(28.41, -106.87)
    assert (box.min_lon, box.min_lat, box.max_lon, box.max_lat) == (-107.75, 27.5, -105.75, 29.5)
    assert box.max_lon - box.min_lon == 2 and box.max_lat - box.min_lat == 2


def test_manifest_shape_lists_chihuahua_first() -> None:
    from pipeline.regions import REGIONS, build_manifest

    manifest = build_manifest()
    assert manifest["version"] == 1 and manifest["generated_at"].endswith("+00:00")
    regions = manifest["regions"]
    assert len(regions) == len(REGIONS) == 13
    assert regions[0]["id"] == "cuauhtemoc" and regions[8]["id"] == "chihuahua-state"
    groups = [r["group"] for r in regions]
    assert groups == sorted(groups)  # all chihuahua before world
    for r in regions:
        assert set(r) == {"id", "name", "group", "bbox", "file"}
        assert r["file"] == f"{r['id']}.json" and len(r["bbox"]) == 4

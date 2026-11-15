"""Benjamini–Hochberg false discovery rate control for many map cells."""

from __future__ import annotations

import numpy as np


def benjamini_hochberg(p_values: np.ndarray, alpha: float = 0.05) -> np.ndarray:
    """Boolean mask of discoveries at FDR level `alpha`.

    Sort p ascending, find the largest k with p_(k) <= k/m * alpha and reject
    the k smallest. Controls the expected share of false positives among the
    cells marked significant (Benjamini & Hochberg, 1995).
    """
    p = np.asarray(p_values, dtype=float)
    m = p.size
    if m == 0:
        return np.zeros(0, dtype=bool)
    order = np.argsort(p)
    thresholds = alpha * np.arange(1, m + 1) / m
    passed = p[order] <= thresholds
    mask = np.zeros(m, dtype=bool)
    if passed.any():
        k = np.nonzero(passed)[0].max()
        mask[order[: k + 1]] = True
    return mask

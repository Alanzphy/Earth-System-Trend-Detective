import pytest

from app.adapters import build_adapters
from app.adapters.fixture import FixtureAnalysisAdapter, FixtureDataAdapter
from app.adapters.real import RealAnalysisAdapter, RealDataAdapter


def test_build_fixture_adapters() -> None:
    data, analysis = build_adapters("fixture")

    assert isinstance(data, FixtureDataAdapter)
    assert isinstance(analysis, FixtureAnalysisAdapter)


def test_build_real_adapters() -> None:
    data, analysis = build_adapters("real")

    assert isinstance(data, RealDataAdapter)
    assert isinstance(analysis, RealAnalysisAdapter)


def test_unknown_adapter() -> None:
    with pytest.raises(ValueError, match="Unknown data adapter"):
        build_adapters("unknown")

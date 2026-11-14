from app.adapters.base import AnalysisAdapter, DataAdapter
from app.adapters.fixture import FixtureAnalysisAdapter, FixtureDataAdapter
from app.adapters.real import RealAnalysisAdapter, RealDataAdapter


def build_adapters(name: str) -> tuple[DataAdapter, AnalysisAdapter]:
    if name == "fixture":
        return FixtureDataAdapter(), FixtureAnalysisAdapter()
    if name == "real":
        return RealDataAdapter(), RealAnalysisAdapter()
    raise ValueError(f"Unknown data adapter: {name}")

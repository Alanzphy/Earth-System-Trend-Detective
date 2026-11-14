from app.core.cache import TTLCache


def test_set_and_get() -> None:
    cache: TTLCache[str] = TTLCache(ttl_seconds=60, clock=lambda: 0.0)
    cache.set("key", "value")

    assert cache.get("key") == "value"


def test_expires() -> None:
    now = 0.0

    def clock() -> float:
        return now

    cache: TTLCache[str] = TTLCache(ttl_seconds=10, clock=clock)
    cache.set("key", "value")
    now = 11.0

    assert cache.get("key") is None


def test_clear() -> None:
    cache: TTLCache[str] = TTLCache(ttl_seconds=60, clock=lambda: 0.0)
    cache.set("key", "value")
    cache.clear()

    assert cache.get("key") is None

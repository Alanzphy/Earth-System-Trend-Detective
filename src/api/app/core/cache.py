import time
from collections.abc import Callable, Hashable


class TTLCache[T]:
    def __init__(
        self,
        ttl_seconds: int,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._ttl_seconds = ttl_seconds
        self._clock = clock
        self._items: dict[Hashable, tuple[float, T]] = {}

    def get(self, key: Hashable) -> T | None:
        item = self._items.get(key)
        if item is None:
            return None

        expires_at, value = item
        if expires_at <= self._clock():
            self._items.pop(key, None)
            return None

        return value

    def set(self, key: Hashable, value: T) -> None:
        self._items[key] = (self._clock() + self._ttl_seconds, value)

    def clear(self) -> None:
        self._items.clear()

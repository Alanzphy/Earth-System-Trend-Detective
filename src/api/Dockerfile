# Build from the repo root: docker build -f src/api/Dockerfile .
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_DEV=1

WORKDIR /app

# Dependencies first, so code changes reuse this layer.
COPY pyproject.toml uv.lock ./
COPY src/api/pyproject.toml src/api/
COPY src/data/pyproject.toml src/data/
COPY src/analysis/pyproject.toml src/analysis/
RUN uv sync --frozen --no-install-workspace --package earth-system-trend-detective-api

COPY src/api src/api
COPY src/data src/data
COPY src/analysis src/analysis
RUN uv sync --frozen --package earth-system-trend-detective-api

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Render injects PORT; default to 8000 locally.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

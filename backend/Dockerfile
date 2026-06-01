# =============================================================================
# backend/Dockerfile
# Multi-stage production build for the FastAPI backend.
# Stage 1 (builder) installs all Python deps.
# Stage 2 (final)   copies only the installed packages + app source.
# =============================================================================

# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.14-slim AS builder

WORKDIR /app

# Install build dependencies needed for psycopg2-binary (libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Stage 2: final ────────────────────────────────────────────────────────────
FROM python:3.14-slim

WORKDIR /app

# Install runtime dependencies (libpq for psycopg2, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder stage
COPY --from=builder /usr/local/lib/python3.14 /usr/local/lib/python3.14
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source
COPY ./app ./app
COPY alembic.ini .
COPY alembic ./alembic

EXPOSE 8000

# Docker healthcheck — used to verify the container is serving traffic
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default CMD — docker-compose overrides this with alembic + uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

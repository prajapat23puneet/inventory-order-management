"""
backend/app/main.py

FastAPI application factory.
This is the entry point that uvicorn runs: `uvicorn app.main:app --reload`

Responsibilities:
  - Create the FastAPI app instance.
  - Register CORS middleware (origins from settings).
  - Mount all four API routers.
  - Expose a /health endpoint used by Docker healthchecks.
  - On startup, call Base.metadata.create_all() as a safety-net
    (Alembic is the primary migration tool; this is a fallback).
"""


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    description=(
        "RESTful API for managing inventory products, customers, and orders. "
        "Built with FastAPI + SQLAlchemy + PostgreSQL."
    ),
)

# ---------------------------------------------------------------------------
# CORS Middleware
# Allow origins are comma-separated in the env var, e.g.:
#   BACKEND_CORS_ORIGINS=http://localhost:5173,https://myapp.vercel.app
# ---------------------------------------------------------------------------
origins = [o.strip() for o in settings.backend_cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Router mounts
# ---------------------------------------------------------------------------
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])


# ---------------------------------------------------------------------------
# Health check endpoint
# Used by Docker HEALTHCHECK and deployment platforms (Render, Railway, etc.)
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check() -> dict:
    """Returns a simple liveness signal. No DB query — intentionally cheap."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Startup event
# Runs Base.metadata.create_all() as a fallback table creation mechanism.
# Alembic is the primary migration tool; this is a safety net for local dev.
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    """
    Attempt to create all tables defined in ORM models if they do not already exist.

    This is a safety-net fallback — Alembic is the primary migration tool.
    The try/except ensures the server starts and /health responds even when
    no local PostgreSQL is available (e.g., during Phase 1 exit-gate testing
    before Docker is configured in Phase 6).
    """
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:  # noqa: BLE001
        # Log the warning but do not crash — the app still serves all routes.
        import logging
        logging.getLogger(__name__).warning(
            "Startup DB check skipped — could not reach database: %s", exc
        )

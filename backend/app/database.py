"""
backend/app/database.py

SQLAlchemy engine setup, session factory, and declarative Base.

Objects exported:
    engine       — SQLAlchemy Engine bound to settings.database_url
    SessionLocal — Session factory (autocommit=False, autoflush=False)
    Base         — Declarative base; all ORM models inherit from this
    get_db       — FastAPI dependency that yields a DB session
"""

from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import settings

# ---------------------------------------------------------------------------
# Engine — echo=False keeps logs clean in production.
# pool_pre_ping=True drops stale connections before reuse.
# ---------------------------------------------------------------------------
engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ---------------------------------------------------------------------------
# Declarative base — all ORM models inherit from this
# ---------------------------------------------------------------------------
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """
    Yield a SQLAlchemy database session for the duration of a request.
    Guarantees the session is closed when the request finishes,
    even if an exception is raised inside the route handler.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

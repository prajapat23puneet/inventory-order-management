"""
backend/alembic/env.py

Alembic environment configuration.

Critical steps implemented (as required by the build plan):
  1. All ORM models are imported so their metadata is registered with Base
     before Alembic compares schemas.
  2. target_metadata = Base.metadata
  3. The DB URL is read from settings.database_url — never hardcoded.
  4. Both offline (--sql) and online (default) migration modes are supported.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ---------------------------------------------------------------------------
# Ensure `app` package is importable when running `alembic` from backend/
# alembic.ini sets prepend_sys_path = . which adds backend/ to sys.path,
# but we add it explicitly here as a belt-and-suspenders guard.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# Import settings FIRST so DATABASE_URL is available, then import Base.
# ---------------------------------------------------------------------------
from app.config import settings  # noqa: E402
from app.database import Base    # noqa: E402

# ---------------------------------------------------------------------------
# Import ALL ORM models so SQLAlchemy registers their tables on Base.metadata.
# This is CRITICAL for --autogenerate to detect every table and constraint.
# ---------------------------------------------------------------------------
from app.models.product import Product        # noqa: F401, E402
from app.models.customer import Customer      # noqa: F401, E402
from app.models.order import Order            # noqa: F401, E402
from app.models.order_item import OrderItem   # noqa: F401, E402

# ---------------------------------------------------------------------------
# Alembic Config object — provides access to values in alembic.ini
# ---------------------------------------------------------------------------
config = context.config

# Set up Python logging from alembic.ini [loggers] section
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# Override sqlalchemy.url from pydantic-settings (reads backend/.env).
# This is the single source of truth for the DB URL; nothing is hardcoded.
# ---------------------------------------------------------------------------
config.set_main_option("sqlalchemy.url", settings.database_url)

# The metadata object that Alembic will diff against the live DB schema.
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migration mode (`alembic upgrade head --sql`)
# Generates SQL without connecting to the DB.
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (outputs raw SQL instead of executing)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migration mode (default — connects to the real DB)
# ---------------------------------------------------------------------------
def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connects to the DB and executes DDL)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


# ---------------------------------------------------------------------------
# Entry point — Alembic calls this module as a script
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

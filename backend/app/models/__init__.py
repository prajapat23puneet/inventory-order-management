# backend/app/models/__init__.py
"""
ORM model package.

Importing all models here guarantees that SQLAlchemy's declarative Base
sees every table when Base.metadata is used (e.g., in Alembic env.py).
"""

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

__all__ = ["Product", "Customer", "Order", "OrderItem"]

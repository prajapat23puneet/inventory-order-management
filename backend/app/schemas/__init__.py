# backend/app/schemas/__init__.py
"""
Pydantic schema package.

Importing all schemas here lets other modules do:
    from app.schemas import ProductCreate, OrderOut, ...

and also satisfies the exit-gate check:
    python -c "from app.schemas import *"
"""

from app.schemas.product import ProductBase, ProductCreate, ProductUpdate, ProductOut
from app.schemas.customer import CustomerBase, CustomerCreate, CustomerOut
from app.schemas.order import OrderItemIn, OrderItemOut, OrderCreate, OrderOut
from app.schemas.dashboard import LowStockProduct, DashboardStats

__all__ = [
    # Product schemas
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductOut",
    # Customer schemas
    "CustomerBase",
    "CustomerCreate",
    "CustomerOut",
    # Order schemas
    "OrderItemIn",
    "OrderItemOut",
    "OrderCreate",
    "OrderOut",
    # Dashboard schemas
    "LowStockProduct",
    "DashboardStats",
]

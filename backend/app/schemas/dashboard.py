"""
backend/app/schemas/dashboard.py

Pydantic V2 response schemas for the dashboard summary endpoint (GET /dashboard).

Classes:
    LowStockProduct — lightweight product representation for the low-stock list
    DashboardStats  — top-level response aggregating all dashboard metrics
"""

from typing import List

from pydantic import BaseModel


class LowStockProduct(BaseModel):
    """
    Lightweight representation of a product that is running low on stock.
    Included in the dashboard response for products where quantity <= 5.
    """

    id: int
    name: str
    sku: str
    quantity: int


class DashboardStats(BaseModel):
    """
    Aggregated statistics returned by GET /dashboard.

    Fields:
        total_products      — count of all products in the catalogue
        total_customers     — count of all registered customers
        total_orders        — count of all orders ever placed
        low_stock_products  — list of products with quantity <= 5
    """

    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[LowStockProduct]

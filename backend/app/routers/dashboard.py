"""
backend/app/routers/dashboard.py

HTTP route handler for GET /dashboard.
Aggregates counts and low-stock data directly via SQLAlchemy queries
(no separate service layer needed — this is a single read-only endpoint).

Endpoints:
  GET /dashboard — return aggregated stats for the frontend landing page
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardStats, LowStockProduct

router = APIRouter()

# Products with quantity at or below this threshold appear in low_stock_products.
LOW_STOCK_THRESHOLD = 5


@router.get(
    "",
    response_model=DashboardStats,
    summary="Get dashboard summary statistics",
)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    """
    Return aggregated inventory statistics for the frontend dashboard:
      - total_products      — count of all products in the catalogue
      - total_customers     — count of all registered customers
      - total_orders        — count of all orders ever placed
      - low_stock_products  — products where quantity <= 5
    """
    total_products: int = db.query(func.count(Product.id)).scalar() or 0
    total_customers: int = db.query(func.count(Customer.id)).scalar() or 0
    total_orders: int = db.query(func.count(Order.id)).scalar() or 0

    low_stock_rows: list[Product] = (
        db.query(Product)
        .filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity.asc())
        .all()
    )

    low_stock_products = [
        LowStockProduct(
            id=p.id,
            name=p.name,
            sku=p.sku,
            quantity=p.quantity,
        )
        for p in low_stock_rows
    ]

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
    )

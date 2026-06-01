"""
backend/app/models/product.py

SQLAlchemy ORM model for the `products` table.

Constraints (enforced at DB level):
  - SKU is unique (UniqueConstraint + unique=True on the column)
  - price must be > 0   (CheckConstraint)
  - quantity must be >= 0 (CheckConstraint)
"""

from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    order_items = relationship("OrderItem", back_populates="product")

    # ------------------------------------------------------------------ #
    # Table-level constraints                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        CheckConstraint("price > 0", name="ck_product_price_positive"),
        CheckConstraint("quantity >= 0", name="ck_product_quantity_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<Product id={self.id} sku={self.sku!r} name={self.name!r}>"

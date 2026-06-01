"""
backend/app/models/order_item.py

SQLAlchemy ORM model for the `order_items` table (join / line-item table).

Important design notes:
  - unit_price is a snapshot of the product price at the time of order creation.
    Even if the product price changes later, historical orders remain accurate.
  - quantity must be > 0 (CheckConstraint)
"""

from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

    # ------------------------------------------------------------------ #
    # Table-level constraints                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_item_quantity_positive"),
    )

    def __repr__(self) -> str:
        return (
            f"<OrderItem id={self.id} order_id={self.order_id} "
            f"product_id={self.product_id} qty={self.quantity}>"
        )

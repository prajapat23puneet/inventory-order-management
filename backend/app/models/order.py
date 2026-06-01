"""
backend/app/models/order.py

SQLAlchemy ORM model for the `orders` table.

Business rules enforced:
  - customer_id is a FK to customers.id (referential integrity)
  - total_amount is computed by the backend — never supplied by the client
  - status defaults to "pending"; allowed values: "pending", "confirmed", "cancelled"
  - cascade="all, delete-orphan" on order_items so deleting an Order also
    removes its OrderItem rows automatically
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    customer = relationship("Customer", back_populates="orders")
    order_items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Order id={self.id} customer_id={self.customer_id} "
            f"status={self.status!r} total={self.total_amount}>"
        )

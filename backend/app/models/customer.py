"""
backend/app/models/customer.py

SQLAlchemy ORM model for the `customers` table.

Constraints (enforced at DB level):
  - email is unique (unique=True on the column)
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    orders = relationship("Order", back_populates="customer")

    def __repr__(self) -> str:
        return f"<Customer id={self.id} email={self.email!r}>"

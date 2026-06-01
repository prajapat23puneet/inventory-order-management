"""
backend/app/services/customer_service.py

Business logic layer for customers.
All database operations for /customers go through here.

Functions:
    get_all_customers    — return all customers, newest first
    get_customer_by_id   — return one customer or raise 404
    create_customer      — insert new customer; raise 400 on duplicate email
    delete_customer      — remove customer; raise 404 if missing
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

def get_all_customers(db: Session) -> list[Customer]:
    """Return all customers ordered by creation date descending (newest first)."""
    return db.query(Customer).order_by(Customer.created_at.desc()).all()


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    """
    Return the customer with the given id.
    Raises HTTP 404 if no matching customer exists.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {customer_id} not found.",
        )
    return customer


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def create_customer(db: Session, data: CustomerCreate) -> Customer:
    """
    Insert a new customer record.

    Raises:
        HTTP 400 — if a customer with the same email is already registered.
    """
    existing = db.query(Customer).filter(Customer.email == data.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{data.email}' is already registered.",
        )

    customer = Customer(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    """
    Delete a customer by id.

    Raises:
        HTTP 404 — if the customer does not exist.
    """
    customer = get_customer_by_id(db, customer_id)  # raises 404 if missing
    db.delete(customer)
    db.commit()

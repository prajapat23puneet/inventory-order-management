"""
backend/app/routers/customers.py

HTTP route handlers for /customers.
Thin layer — all business logic is delegated to customer_service.

Endpoints:
  GET    /customers             — list all customers
  GET    /customers/{id}        — get one customer by id
  POST   /customers             — create a new customer (201)
  DELETE /customers/{id}        — delete a customer
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerOut
from app.services import customer_service

router = APIRouter()


@router.get(
    "",
    response_model=list[CustomerOut],
    summary="List all customers",
)
def list_customers(db: Session = Depends(get_db)) -> list[CustomerOut]:
    """Return every registered customer, newest first."""
    return customer_service.get_all_customers(db)


@router.get(
    "/{customer_id}",
    response_model=CustomerOut,
    summary="Get a customer by ID",
)
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> CustomerOut:
    """Return a single customer. Raises 404 if not found."""
    return customer_service.get_customer_by_id(db, customer_id)


@router.post(
    "",
    response_model=CustomerOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer",
)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)) -> CustomerOut:
    """
    Register a new customer.
    Raises 400 if the email address is already in use.
    """
    return customer_service.create_customer(db, data)


@router.delete(
    "/{customer_id}",
    summary="Delete a customer",
)
def delete_customer(customer_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a customer. Raises 404 if not found."""
    customer_service.delete_customer(db, customer_id)
    return {"message": "Customer deleted successfully"}

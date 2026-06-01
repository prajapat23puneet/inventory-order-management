"""
backend/app/routers/orders.py

HTTP route handlers for /orders.
Thin layer — all business logic is delegated to order_service.

Endpoints:
  GET    /orders             — list all orders (with line items)
  GET    /orders/{id}        — get one order by id (with line items)
  POST   /orders             — create a new order (201)
  DELETE /orders/{id}        — cancel/delete an order
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.services import order_service

router = APIRouter()


@router.get(
    "",
    response_model=list[OrderOut],
    summary="List all orders",
)
def list_orders(db: Session = Depends(get_db)) -> list[OrderOut]:
    """Return all orders with their line items, newest first."""
    return order_service.get_all_orders(db)


@router.get(
    "/{order_id}",
    response_model=OrderOut,
    summary="Get an order by ID",
)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderOut:
    """Return a single order with its line items. Raises 404 if not found."""
    return order_service.get_order_by_id(db, order_id)


@router.post(
    "",
    response_model=OrderOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
def create_order(data: OrderCreate, db: Session = Depends(get_db)) -> OrderOut:
    """
    Create a new order atomically.
    Raises 404 if customer or any product is not found.
    Raises 400 if stock is insufficient for any line item.
    """
    return order_service.create_order(db, data)


@router.delete(
    "/{order_id}",
    summary="Cancel / delete an order",
)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete an order and all its line items. Raises 404 if not found."""
    order_service.delete_order(db, order_id)
    return {"message": "Order cancelled successfully"}

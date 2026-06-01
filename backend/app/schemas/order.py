"""
backend/app/schemas/order.py

Pydantic V2 schemas for request validation and response serialization of orders
and their line items.

Classes:
    OrderItemIn  — one product row in an order creation request
    OrderItemOut — response schema for a single order line item
    OrderCreate  — POST /orders request body
    OrderOut     — full response schema for a created or retrieved order
"""

from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class OrderItemIn(BaseModel):
    """
    Represents one product line in an order creation request.

    `product_id` must reference a valid product (validated by the service layer).
    `quantity` must be > 0 — you cannot order zero units of a product.
    """

    product_id: int
    quantity: int = Field(..., gt=0, description="Number of units — must be at least 1")


class OrderItemOut(BaseModel):
    """
    Response schema for a single order line item.

    `unit_price` is a snapshot of the product price at order creation time.
    It is stored independently so that future product price changes do not
    alter historical order totals.
    """

    id: int
    product_id: int
    quantity: int
    unit_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    """
    Request body for POST /orders.

    `items` must contain at least one line item (min_length=1).
    The backend calculates `total_amount` — clients must NOT supply it.
    """

    customer_id: int
    items: List[OrderItemIn] = Field(
        ...,
        min_length=1,
        description="Line items for the order — at least one product is required",
    )


class OrderOut(BaseModel):
    """
    Full response schema for a created or retrieved order.

    `order_items` is eagerly loaded in the service layer to prevent N+1 queries.
    `from_attributes=True` enables construction from SQLAlchemy ORM objects.
    """

    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    order_items: List[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)

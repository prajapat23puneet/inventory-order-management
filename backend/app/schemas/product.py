"""
backend/app/schemas/product.py

Pydantic V2 schemas for request validation and response serialization of products.

Classes:
    ProductBase   — shared fields with validation rules
    ProductCreate — POST /products request body (inherits ProductBase)
    ProductUpdate — PUT /products/{id} request body (all fields optional)
    ProductOut    — response schema returned to API clients
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    """
    Shared product fields with validation constraints.
    Used as the base for both request and response schemas.
    """

    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Unit price — must be greater than 0")
    quantity: int = Field(..., ge=0, description="Stock quantity — cannot be negative")


class ProductCreate(ProductBase):
    """
    Request body for POST /products.
    Inherits all fields and validation rules from ProductBase.
    No additional fields — the client supplies only the core attributes.
    """


class ProductUpdate(BaseModel):
    """
    Request body for PUT /products/{id}.
    All fields are optional so partial updates work (PATCH semantics via PUT).
    Validation rules still apply when a field is provided.
    """

    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    quantity: Optional[int] = Field(default=None, ge=0)


class ProductOut(ProductBase):
    """
    Response schema returned to API clients.
    Extends ProductBase with DB-generated fields.
    `from_attributes=True` enables construction from SQLAlchemy ORM objects.
    """

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

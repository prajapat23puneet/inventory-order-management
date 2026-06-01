"""
backend/app/schemas/customer.py

Pydantic V2 schemas for request validation and response serialization of customers.

Classes:
    CustomerBase   — shared fields; uses EmailStr for validated email format
    CustomerCreate — POST /customers request body (inherits CustomerBase)
    CustomerOut    — response schema returned to API clients
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    """
    Shared customer fields with validation constraints.

    `email` uses pydantic's `EmailStr` type which validates the format of the
    email address. Requires the `email-validator` package (already in requirements.txt).
    """

    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)


class CustomerCreate(CustomerBase):
    """
    Request body for POST /customers.
    Inherits all fields and validation rules from CustomerBase.
    """


class CustomerOut(CustomerBase):
    """
    Response schema returned to API clients.
    Extends CustomerBase with the DB-generated `id` and `created_at` fields.
    `from_attributes=True` enables construction from SQLAlchemy ORM objects.
    """

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

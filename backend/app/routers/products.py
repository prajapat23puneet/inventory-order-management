"""
backend/app/routers/products.py

HTTP route handlers for /products.
Thin layer — all business logic is delegated to product_service.

Endpoints:
  GET    /products             — list all products
  GET    /products/{id}        — get one product by id
  POST   /products             — create a new product (201)
  PUT    /products/{id}        — partial update a product
  DELETE /products/{id}        — delete a product
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services import product_service

router = APIRouter()


@router.get(
    "",
    response_model=list[ProductOut],
    summary="List all products",
)
def list_products(db: Session = Depends(get_db)) -> list[ProductOut]:
    """Return every product in the catalogue, newest first."""
    return product_service.get_all_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductOut,
    summary="Get a product by ID",
)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    """Return a single product. Raises 404 if not found."""
    return product_service.get_product_by_id(db, product_id)


@router.post(
    "",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
)
def create_product(data: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    """
    Create a new product in the catalogue.
    Raises 400 if the SKU already exists.
    """
    return product_service.create_product(db, data)


@router.put(
    "/{product_id}",
    response_model=ProductOut,
    summary="Update a product",
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductOut:
    """
    Partially update an existing product.
    Only fields present in the request body are changed.
    Raises 404 if not found; 400 if the new SKU conflicts.
    """
    return product_service.update_product(db, product_id, data)


@router.delete(
    "/{product_id}",
    summary="Delete a product",
)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a product. Raises 404 if not found."""
    product_service.delete_product(db, product_id)
    return {"message": "Product deleted successfully"}

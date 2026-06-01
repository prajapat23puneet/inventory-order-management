"""
backend/app/services/product_service.py

Business logic layer for products.
All database operations for /products go through here.
Routers call these functions — they never touch the DB directly.

Functions:
    get_all_products    — return all products, newest first
    get_product_by_id   — return one product or raise 404
    create_product      — insert new product; raise 400 on duplicate SKU
    update_product      — partial update; raise 404 / 400 as appropriate
    delete_product      — remove product; raise 404 if missing
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

def get_all_products(db: Session) -> list[Product]:
    """Return all products ordered by creation date descending (newest first)."""
    return db.query(Product).order_by(Product.created_at.desc()).all()


def get_product_by_id(db: Session, product_id: int) -> Product:
    """
    Return the product with the given id.
    Raises HTTP 404 if no matching product exists.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found.",
        )
    return product


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def create_product(db: Session, data: ProductCreate) -> Product:
    """
    Insert a new product record.

    Raises:
        HTTP 400 — if a product with the same SKU already exists.
    """
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SKU '{data.sku}' already exists.",
        )

    product = Product(
        name=data.name,
        sku=data.sku,
        description=data.description,
        price=data.price,
        quantity=data.quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    """
    Apply a partial update to an existing product.

    Raises:
        HTTP 404 — if the product does not exist.
        HTTP 400 — if the new SKU conflicts with another product's SKU.
    """
    product = get_product_by_id(db, product_id)  # raises 404 if missing

    # If the caller wants to change the SKU, ensure the new SKU is unique.
    if data.sku is not None and data.sku != product.sku:
        conflict = db.query(Product).filter(Product.sku == data.sku).first()
        if conflict is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{data.sku}' is already used by another product.",
            )

    # Apply only the fields that were explicitly provided (non-None).
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    """
    Delete a product by id.

    Raises:
        HTTP 404 — if the product does not exist.
    """
    product = get_product_by_id(db, product_id)  # raises 404 if missing
    db.delete(product)
    db.commit()

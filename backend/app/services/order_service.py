"""
backend/app/services/order_service.py

Business logic layer for orders — the most complex service in the application.

Key invariants enforced:
  - The entire create_order flow is a single atomic DB transaction.
    If any step fails (e.g. insufficient stock), the whole transaction rolls
    back and nothing is committed — no partial stock deductions can occur.
  - Stock is deducted from product.quantity at order-creation time.
  - unit_price is snapshotted from product.price at creation time, so future
    price changes never affect historical order totals.
  - joinedload is used on order_items to avoid N+1 queries.

Functions:
    get_all_orders   — return all orders with their items, newest first
    get_order_by_id  — return one order (with items) or raise 404
    create_order     — atomic order creation with stock validation & deduction
    delete_order     — remove order (cascade deletes items); raise 404 if missing
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services import customer_service, product_service


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

def get_all_orders(db: Session) -> list[Order]:
    """
    Return all orders, newest first.
    Uses joinedload on order_items to fetch line items in the same query,
    preventing N+1 queries when the response is serialized.
    """
    return (
        db.query(Order)
        .options(joinedload(Order.order_items))
        .order_by(Order.created_at.desc())
        .all()
    )


def get_order_by_id(db: Session, order_id: int) -> Order:
    """
    Return the order with the given id, with its line items eagerly loaded.
    Raises HTTP 404 if no matching order exists.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.order_items))
        .filter(Order.id == order_id)
        .first()
    )
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found.",
        )
    return order


# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

def create_order(db: Session, data: OrderCreate) -> Order:
    """
    Create a new order atomically.

    Algorithm (all steps run inside a single transaction):
      1. Validate the customer exists — raises 404 if not.
      2. For each line item, fetch the product and validate stock level.
         Raises 400 with a descriptive message if stock is insufficient.
      3. Calculate total_amount = sum(product.price * item.quantity).
      4. Persist the Order header and flush to obtain order.id without committing.
      5. For each item:
           a. Create an OrderItem row (with unit_price snapshot).
           b. Deduct item.quantity from product.quantity.
      6. Commit the transaction.
         If anything raised an exception before this point, SQLAlchemy's
         context manager guarantees a rollback — no partial side-effects.

    Raises:
        HTTP 404 — customer or product not found.
        HTTP 400 — insufficient stock for any requested product.
    """
    # Step 1 — validate customer
    customer_service.get_customer_by_id(db, data.customer_id)  # raises 404 if missing

    # Step 2 — validate stock for every line item (fail fast before any writes)
    # We also build a lookup dict so we don't re-query products in step 5.
    product_map: dict[int, Product] = {}
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found.",
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.quantity}, requested: {item.quantity}."
                ),
            )
        product_map[item.product_id] = product

    # Step 3 — calculate total_amount
    # Use Decimal arithmetic to avoid floating-point rounding issues.
    total_amount = sum(
        Decimal(str(product_map[item.product_id].price)) * item.quantity
        for item in data.items
    )

    # Step 4 — create the Order header and flush to get order.id
    order = Order(
        customer_id=data.customer_id,
        total_amount=total_amount,
        status="pending",
    )
    db.add(order)
    db.flush()  # assigns order.id without committing; still inside transaction

    # Step 5 — create OrderItems and deduct stock (all in the same transaction)
    for item in data.items:
        product = product_map[item.product_id]

        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price,  # price snapshot
        )
        db.add(order_item)

        # Deduct stock — this is the authoritative stock reduction.
        product.quantity -= item.quantity

    # Step 6 — commit the entire transaction atomically
    db.commit()
    db.refresh(order)

    # Re-load with joinedload so the returned object has order_items populated.
    return get_order_by_id(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    """
    Delete an order by id.
    cascade="all, delete-orphan" on Order.order_items handles OrderItem cleanup.

    Raises:
        HTTP 404 — if the order does not exist.
    """
    order = get_order_by_id(db, order_id)  # raises 404 if missing
    db.delete(order)
    db.commit()

from fastapi import APIRouter, Depends
from auth import get_current_user

from repository.cart_repository import get_or_create_cart, get_cart_items, add_item_to_cart, update_cart_quantity, remove_cart_item


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.get("")
def get_cart(current_user=Depends(get_current_user)):
    user = current_user["user"]

    cart = get_or_create_cart(user["id"])
    items = get_cart_items(cart["id"])

    return {
        "cartId": cart["id"],
        "items": items
    }


@router.post("/items")
def add_to_cart(
    payload: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    product_id = payload["productId"]
    quantity = payload.get("quantity", 1)
    delivery_option_id = payload.get("deliveryOptionId", "1")

    cart = get_or_create_cart(user["id"])

    add_item_to_cart(
        cart["id"],
        product_id,
        quantity,
        delivery_option_id
    )

    items = get_cart_items(cart["id"])

    return {
        "message": "Item added to cart",
        "items": items
    }


@router.patch("/items/{product_id}")
def update_quantity(
    product_id: str,
    payload: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    quantity = payload["quantity"]

    cart = get_or_create_cart(user["id"])

    update_cart_quantity(
        cart["id"],
        product_id,
        quantity
    )

    items = get_cart_items(cart["id"])

    return {
        "message": "Cart updated",
        "items": items
    }


@router.delete("/items/{product_id}")
def delete_cart_item(
    product_id: str,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    cart = get_or_create_cart(user["id"])

    remove_cart_item(
        cart["id"],
        product_id
    )

    items = get_cart_items(cart["id"])

    return {
        "message": "Item removed from cart",
        "items": items
    }

from fastapi import APIRouter, Depends
from auth import get_current_user

from repository.profile_repository import add_address, delete_address, set_default_address, update_address, get_user_addresses

from repository.profile_repository import get_user_payments, add_payment_method, delete_payment_method, set_default_payment, update_payment_method


router = APIRouter(prefix="/profile", tags=["Profile"])

# Payments Router


@router.get("/payments")
def get_payments(current_user=Depends(get_current_user)):
    user = current_user["user"]

    return get_user_payments(user["id"])


@router.post("/payments")
def create_payment(
    payment: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    payment_id = add_payment_method(
        user["id"],
        payment
    )

    return {
        "message": "Payment method added",
        "paymentId": payment_id
    }


@router.delete("/payments/{payment_id}")
def delete_payment(
    payment_id: str,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    delete_payment_method(user["id"], payment_id)

    return {
        "message": "Payment method deleted successfully"
    }


@router.patch("/payments/{payment_id}/default")
def make_default_payment(
    payment_id: str,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    set_default_payment(user["id"], payment_id)

    return {
        "message": "Default payment updated successfully"
    }


@router.patch("/payments/{payment_id}")
def update_payment(
    payment_id: str,
    payment: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    update_payment_method(user["id"], payment_id, payment)

    return {
        "message": "Payment updated successfully"
    }

    # Addresses Router


@router.get("/addresses")
def get_addresses(current_user=Depends(get_current_user)):
    user = current_user["user"]
    return get_user_addresses(user["id"])


@router.post("/addresses")
def create_address(
    address: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    address_id = add_address(
        user["id"],
        address
    )

    return {
        "message": "Address added",
        "addressId": address_id
    }


@router.delete("/addresses/{address_id}")
def remove_address(
    address_id: str,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    delete_address(user["id"], address_id)

    return {
        "message": "Address deleted"
    }


@router.patch("/addresses/{address_id}/default")
def make_default_address(
    address_id: str,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    set_default_address(
        user["id"],
        address_id
    )

    return {
        "message": "Default address updated"
    }


@router.patch("/addresses/{address_id}")
def update_address_route(
    address_id: str,
    address: dict,
    current_user=Depends(get_current_user)
):
    user = current_user["user"]

    update_address(user["id"], address_id, address)

    return {"message": "Address updated"}

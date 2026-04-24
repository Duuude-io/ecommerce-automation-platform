from pydantic import BaseModel
from typing import List
from typing import Optional


class OrderItem(BaseModel):
    productId: str
    quantity: int


class BillingDetails(BaseModel):
    firstName: str
    lastName: str
    apartment: Optional[str] = None
    streetAddress: str
    city: str
    state: str
    zipCode: str
    phone: str | None = None
    email: str


class Order(BaseModel):
    items: List[OrderItem]
    billingDetails: BillingDetails
    totalCostCents: int

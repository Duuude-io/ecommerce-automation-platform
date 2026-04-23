from pydantic import BaseModel
from typing import List
from typing import Optional


class OrderItem(BaseModel):
    productId: str
    quantity: int


class BillingDetails(BaseModel):
    fullName: str
    email: str
    address: str
    city: str
    state: str


class Order(BaseModel):
    id: Optional[str] = None
    items: List[OrderItem]
    billingDetails: BillingDetails
    totalCents: int

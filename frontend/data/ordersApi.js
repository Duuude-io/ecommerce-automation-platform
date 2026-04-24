import { cart } from './cart-class.js'
import { getDeliveryOption, calculateDeliveryDate } from './deliveryOptions.js';

export async function createOrder(orderData) {
  const response = await fetch('http://127.0.0.1:8000/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Order creation failed');
  }

  return response.json();
}

export async function fetchOrders() {
  const response = await fetch('http://127.0.0.1:8000/orders');
  return response.json();
}

export function buildOrderData(cartItems, billingDetails, totalCents) {
  const items = cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    deliveryOptionId: item.deliveryOptionId,
    estimatedDeliveryTime:
      calculateDeliveryDate(
        getDeliveryOption(item.deliveryOptionId)
      )
  }));

  return {
    items,
    billingDetails,
    totalCostCents: totalCents
  };
}

export async function cancelOrder(orderId) {
  const response = await fetch(
    `http://127.0.0.1:8000/orders/${orderId}`,
    {
      method: 'DELETE'
    }
  );

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  return response.json();
}
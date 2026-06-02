import { cart } from './cart-class.js'
import { getDeliveryOption, calculateDeliveryDate } from './deliveryOptions.js';
import { getProduct } from './products.js';

export async function createOrder(orderData) {

  const token = localStorage.getItem('token');
  console.log("TOKEN SENT:", token);

  const response = await fetch('http://127.0.0.1:8000/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  const data = await response.json();

  if (!response.ok) {

    console.log(data);
    throw new Error('Order creation failed');
  }

  return data;
}

export async function fetchOrders() {
  const token = localStorage.getItem('token'); // Get the token

  const response = await fetch('http://127.0.0.1:8000/orders', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

export function buildOrderData(cartItems, billingDetails) {
  const items = cartItems.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    deliveryOptionId: item.deliveryOptionId,
    estimatedDeliveryTime:
      calculateDeliveryDate(
        getDeliveryOption(item.deliveryOptionId)
      )
  }));


  let subTotalCents = 0;

  cartItems.forEach(item => {
    const product = getProduct(item.productId);

    subTotalCents += product.priceCents * item.quantity;
  });

  const selectedDeliveryOption =
    getDeliveryOption(
      cartItems[0]?.deliveryOptionId || '1');

  const shippingCents =
    selectedDeliveryOption.priceCents;

  const totalBeforeTaxCents =
    subTotalCents + shippingCents;

  const taxCents =
    Math.round(totalBeforeTaxCents * 0.10);

  const totalCostCents =
    subTotalCents +
    shippingCents +
    taxCents;

  console.log({
    subTotalCents,
    shippingCents,
    taxCents,
    totalCostCents
  });

  return {
    items,
    billingDetails,

    subTotalCents,
    shippingCents,
    taxCents,
    totalCostCents
  };
}

export async function cancelOrder(orderId) {
  const token = localStorage.getItem('token');

  const response = await fetch(`http://127.0.0.1:8000/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order');
  }

  return response.json();
}
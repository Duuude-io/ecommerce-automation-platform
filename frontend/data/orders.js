import { cart } from './cart-class.js'
export let orders = JSON.parse(localStorage.getItem('orders')) || [];

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function getOrder(orderId) {
  return orders.find(order => order.id === orderId);
}

export function cancelOrder(orderId) {
  orders = orders.filter(order => order.id !== orderId);

  saveToStorage();
}

export function attachEventListeners() {
  const button = document.querySelector('.js-complete-purchase-button');

  if (!button) return;

  button.addEventListener('click', handlePlaceOrder);
}

async function handlePlaceOrder() {
  if (cart.cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  try {
    const response = await fetch('https://supersimplebackend.dev/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cart.cartItems })
    });

    if (!response.ok) throw new Error('Order failed');

    const order = await response.json();

    addOrder(order);
    cart.resetCart();

    window.location.href = 'orders.html';

  } catch (err) {
    console.log(err);
  }
}
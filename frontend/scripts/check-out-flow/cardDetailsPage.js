import { checkoutSession } from './checkoutSession.js';
import { createOrder, buildOrderData } from '../../data/ordersApi.js';
import { cart } from '../../data/cart-class.js';
import { loadProductsFetch } from '../../data/products.js';
import { calculateCartTotal } from '../checkout/paymentEvents.js';

console.log("Card Details Page Loaded")

document.addEventListener('DOMContentLoaded', initPage);

async function initPage() {

  await loadProductsFetch();

  const page = document.querySelector('.card-details-page');

  if (!page) return;

  const form = page.querySelector('.create-form');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    handleSubmit(event, page);
  });
}

async function handleSubmit(event, page) {

  event.preventDefault();

  const cardDetails = {
    cardNumber: page.querySelector('.js-card-number').value,
    expiry: page.querySelector('.js-expiry-number').value,
    cvv: page.querySelector('.js-cvv-number').value
  };

  checkoutSession.save({
    cardDetails
  });

  const session = checkoutSession.get();

  try {

    const orderData = buildOrderData(
      cart.cartItems,
      session.billingDetails,
    );

    const result = await createOrder(orderData);

    console.log('Order created:', result);

    checkoutSession.save({
      lastOrderId: result.orderId
    });

    cart.resetCart();

    window.location.href = 'checkoutSuccess.html';

  } catch (error) {

    console.error(error);

    alert('Order failed');
  }
}
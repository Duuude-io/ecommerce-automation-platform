import { checkoutSession } from './checkoutSession.js';

console.log("Payment Method Page Loaded")

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {

  const page = document.querySelector('.pay-method-page');

  if (!page) return;

  const button = page.querySelector('.primary-button');

  if (!button) return;

  button.addEventListener('click', handleContinue);
}

function handleContinue() {

  const selected = document.querySelector(
    'input[name="payment-method"]:checked'
  );

  if (!selected) {
    alert('Select payment method');
    return;
  }

  const paymentMethod = selected.value;

  checkoutSession.save({
    paymentMethod
  });

  if (paymentMethod === 'card') {
    window.location.href = 'cardDetailsPage.html';
    return;
  }

  if (paymentMethod === 'paypal') {
    window.location.href = 'paypalPage.html';
    return;
  }

  if (paymentMethod === 'cashapp') {
    window.location.href = 'cashappPage.html';
    return;
  }

  if (paymentMethod === 'venmo') {
    window.location.href = 'venmoPage.html';
  }
}
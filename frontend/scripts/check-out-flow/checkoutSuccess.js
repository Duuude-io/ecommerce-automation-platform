import { checkoutSession } from './checkoutSession.js';

console.log('Checkout Success Page Loaded');
document.addEventListener('DOMContentLoaded', initPage);

function initPage() {
  const page = document.querySelector('.checkout-success-page');
  if (!page) return;

  const session = checkoutSession.get();

  const urlParams = new URLSearchParams(window.location.search);
  let orderId = urlParams.get('orderId');

  if (!orderId) {
    orderId = session.lastOrderId || 'Unavailable';
  }

  console.log("SUCCESS SESSION:", session);
  console.log(window.location.href);

  displayOrderId(page, orderId);
  setupContinueButton(page);
  clearCheckoutFlow(orderId);
}

function displayOrderId(page, orderId) {
  const orderIdElement = page.querySelector('.js-order-id');
  const receiptLink = page.querySelector('.js-receipt-link');

  if (!orderIdElement) return;

  orderIdElement.textContent = orderId;

  console.log(orderIdElement);

  if (receiptLink) {
    receiptLink.innerHTML = `
      <a href="../receipts.html?orderId=${orderId}" class="view-receipt-btn">
        View Receipt
      </a>
    `;
  }
}

function setupContinueButton(page) {
  const button = page.querySelector('.primary-button');
  if (!button) return;

  button.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}

function clearCheckoutFlow(activeOrderId) {
  checkoutSession.save({
    lastOrderId: activeOrderId,
    billingDetails: null,
    paymentMethod: null,
    cardDetails: null,
    selectedPaymentId: null
  });
}
import { checkoutSession } from './checkoutSession.js';

console.log('Checkout Success Page Loaded');

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {

  const page = document.querySelector('.checkout-success-page');

  if (!page) return;

  displayOrderId(page);

  setupContinueButton(page);

  clearCheckoutFlow();
}

function displayOrderId(page) {

  const orderIdElement = page.querySelector('.js-order-id');

  const receiptLink = page.querySelector('.js-receipt-link');

  if (!orderIdElement) return;

  const session = checkoutSession.get();

  const orderId =
    session.lastOrderId || 'Unavailable';

  orderIdElement.textContent = orderId;

  if (receiptLink) {

    receiptLink.innerHTML = `
      <a
        href="../receipts.html?orderId=${orderId}"
        class="view-receipt-btn"
      >
        View Receipt
      </a>
    `;
  }
}

function setupContinueButton(page) {

  const button =
    page.querySelector('.primary-button');

  if (!button) return;

  button.addEventListener('click', () => {

    window.location.href = '../amazon.html';
  });
}

function clearCheckoutFlow() {

  const session = checkoutSession.get();

  checkoutSession.save({

    lastOrderId: session.lastOrderId,

    billingDetails: null,

    paymentMethod: null,

    cardDetails: null
  });
}

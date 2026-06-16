import { checkoutSession } from './checkoutSession.js';
import { getPayments } from "../paymentStore.js";

console.log("Payment Method Page Loaded")

console.log(import.meta.url);

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {
  renderSavedCards();

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

  console.log("paymentMethod")

  if (paymentMethod.startsWith("saved-card-")) {
    checkoutSession.save({
      paymentMethod,
      selectedPaymentId:
        paymentMethod.replace("saved-card-", "")
    });

    window.location.href = "cardreview.html";
    return;
  }

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

function renderSavedCards() {
  const container = document.querySelector(".js-saved-cards");
  if (!container) return;

  const payments = getPayments();

  if (payments.length === 0) {
    container.innerHTML = `
      <p>No saved cards</p>
    `;
    return;
  }

  container.innerHTML = payments.map(payment => {

    const maskedCardNumber = (
      payment?.last16 || "0000").slice(-4);

    return `
      <label>
        <input
          type="radio"
          name="payment-method"
          value="saved-card-${payment.id}"
        >

        ${payment.isDefault ? "(Default)" : ""}
        ${payment.cardType} ****${maskedCardNumber}
      </label>
    `
  }).join("");
}
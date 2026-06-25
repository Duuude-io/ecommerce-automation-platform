import { checkoutSession } from './checkoutSession.js';
import { API_BASE_URL } from "../config.js";
import { auth } from "../auth/authStore.js";


console.log("Payment Method Page Loaded")
console.log(import.meta.url);

let savedPayments = [];

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

    const paymentId =
      paymentMethod.replace("saved-card-", "");

    const payment = savedPayments.find(
      payment => payment.id === paymentId
    );

    console.log(savedPayments)

    checkoutSession.save({
      paymentMethod,
      selectedPayment: payment,
      selectedPaymentId: paymentId
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

async function renderSavedCards() {
  const container = document.querySelector(".js-saved-cards");
  if (!container) return;

  const token = auth.getToken();

  if (!token) {
    console.error("Missing auth token");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/profile/payments`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load payments");
    }

    savedPayments = await res.json();

    if (!savedPayments.length) {
      container.innerHTML = `
      <p>No saved cards</p>
    `;
      return;
    }

    container.innerHTML = savedPayments.map(payment => {

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

  } catch (error) {
    console.error(error);
  }
}
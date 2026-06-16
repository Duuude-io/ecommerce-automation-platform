import { checkoutSession } from "./checkoutSession.js";
import { getPayments, getDefaultPayment } from "../paymentStore.js";
import { cart } from "../../data/cart-class.js";
import { products } from "../../data/products.js";
import { loadProductsFetch } from "../../data/products.js";
import { getCartTotals } from "../checkout/paymentSummary.js";
import { formatCurrency } from "../utils/money.js";
import { getAddresses } from "../paymentStore.js";
import { createOrder, buildOrderData } from "../../data/ordersApi.js";

console.log("Card Review Page Loaded");

document.addEventListener("DOMContentLoaded", async () => {
  await loadProductsFetch();
  initPage();
});

function initPage() {
  console.log("Products loaded:", products.length);
  renderSelectedCard();
  renderBillingAddress();
  document.addEventListener("click", handlePayNow);
}

function renderSelectedCard() {
  const container = document.querySelector(
    ".js-card-preview"
  );
  if (!container) return;

  const session = checkoutSession.get();
  const paymentId = session.selectedPaymentId;
  const payments = getPayments();
  const payment = payments.find(
    payment => payment.id === paymentId
  );

  console.log(payment, paymentId)

  if (!payment) {
    container.innerHTML = `
      <p>No saved card found.</p>
    `;
    return;
  }

  const maskedCardNumber = (
    payment?.last16 || "0000").slice(-4);

  const { totalCents } = getCartTotals();

  container.innerHTML = `
    <h3>Selected Card</h3>

    <p>${payment.cardType}</p>

    <p>
      **** **** **** ${maskedCardNumber}
    </p>

    <p>
      Expires ${payment.expiry}
    </p>

    <div class="review-section js-billing-preview">
      <h3>Shipping To </h3>
    </div>

    <div class="review-section">
      <h3>Security Check</h3>
      <input type="password" class="js-review-cvv" maxlength="4" placeholder="Enter CVV">
    </div>

    <button type="button" class="primary-button js-pay-now-button">
      Pay Now __ $${formatCurrency(totalCents)}
    </button>
  `;
}

function renderBillingAddress() {
  const container = document.querySelector(
    ".js-billing-preview"
  );

  if (!container) return;

  const session = checkoutSession.get();

  console.log("checkoutSession:", checkoutSession.get());

  let billingAddress;

  // NEW CARD FLOW → use checkout form details
  if (session.billingDetails) {
    billingAddress = session.billingDetails;
  } else {
    // SAVED CARD FLOW → use default saved address
    const addresses = getAddresses();

    console.log("addresses:", getAddresses());

    billingAddress = addresses.find(
      address => address.isDefault
    );
  }

  if (!billingAddress) {
    container.innerHTML = `
      <h3>Shpping To </h3>
      <p>No billing address found.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h3>Shipping To </h3>
    <p>${billingAddress.fullName}</p>
    <p>${billingAddress.phone}</p>
    <p>${billingAddress.streetAddress}</p>
    <p>
      ${billingAddress.city},
      ${billingAddress.state}
    </p>
  `;
}

async function handlePayNow(event) {
  if (!event.target.classList.contains(
    "js-pay-now-button"
  )) {
    return;
  }

  const enteredCVV = document.querySelector(
    ".js-review-cvv"
  )?.value.trim();

  if (!enteredCVV) {
    alert("Please enter CVV");
    return;
  }

  const session = checkoutSession.get();

  console.log("checkoutSession:", checkoutSession.get());
  const payments = getPayments();

  const payment = payments.find(
    payment => payment.id === session.selectedPaymentId
  );

  if (!payment) {
    alert("Payment method not found");
    return;
  }

  if (enteredCVV !== payment.cvv) {
    alert("Invalid CVV");
    return;
  }

  await processOrder();
}

async function processOrder() {
  try {
    const session = checkoutSession.get();

    let billingDetails = session.billingDetails;

    console.log("SESSION:", checkoutSession.get());

    // fallback to default saved address
    if (!billingDetails) {
      const addresses = getAddresses();
      billingDetails = addresses.find(
        address => address.isDefault
      );
    }

    if (!billingDetails) {
      alert("Billing address missing");
      return;
    }

    const orderData = buildOrderData(
      cart.cartItems,
      billingDetails
    );

    console.log("ORDER PAYLOAD:", orderData);
    const order = await createOrder(orderData);

    console.log("ORDER CREATED:", order);

    checkoutSession.save({
      lastOrderId: order.orderId
    });

    cart.resetCart();
    window.location.href = `checkoutSuccess.html?orderId=${order.orderId}`;

  } catch (error) {
    console.error(error);
    alert("Payment failed");
  }
}
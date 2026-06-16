import { getPayments, savePayments } from "../paymentStore.js"

console.log("Payment Method Loaded")

let editingPaymentId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadPayments();

  document.querySelector(".js-save-payment")
    ?.addEventListener("click", savePaymentMethod);

  document.querySelector(".js-payment-list")
    ?.addEventListener("click", handlePaymentActions);
});

document.querySelector(".js-add-payment")
  ?.addEventListener("click", () => {
    console.log("button clicked");

    const form = document.querySelector(".js-payment-form");

    if (!form) {
      console.error("Payment form not found");
      return;
    }

    form.classList.toggle("hidden");
  });

function savePaymentMethod() {
  const cardType = document.querySelector(".js-card-type")
    .value.trim();

  const cardName = document.querySelector(".js-card-name")
    .value.trim();

  const last16 = document.querySelector(".js-last16")
    .value.trim();

  const expiry = document.querySelector(".js-expiry")
    .value.trim();

  const cvv = document.querySelector(".js-cvv")
    .value.trim();

  const billingZip = document.querySelector(".js-billing-zip")
    .value.trim();

  const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

  if (!expiryPattern.test(expiry)) {
    alert("Use MM/YY format");
    return;
  }

  if (!cardType || !last16 || !expiry || !cardName || !billingZip) {
    alert("Please fill all fields");
    return;
  }


  if (!/^\d{16}$/.test(last16)) {
    alert("Card number not valid");
    return;
  }

  const payments = JSON.parse(
    localStorage.getItem("payments")
  ) || [];

  if (editingPaymentId) {
    const index = payments.findIndex(
      payment => payment.id === editingPaymentId
    );

    if (index !== -1) {
      payments[index] = {
        ...payments[index],
        cardType,
        cardName,
        last16,
        expiry,
        cvv,
        billingZip
      };
    }
    editingPaymentId = null;

  } else {
    const payment = {
      id: crypto.randomUUID(),
      cardType,
      cardName,
      last16,
      expiry,
      cvv,
      billingZip,
      isDefault: payments.length === 0
    };

    payments.push(payment);
  }

  localStorage.setItem(
    "payments",
    JSON.stringify(payments)
  );

  document.querySelector(".empty-state")?.remove();

  document.querySelector(".js-card-type").value = "";
  document.querySelector(".js-card-name").value = "";
  document.querySelector(".js-last16").value = "";
  document.querySelector(".js-expiry").value = "";
  document.querySelector(".js-cvv").value = "";
  document.querySelector(".js-billing-zip").value = "";


  refreshPayments();
}

function renderPaymentCard(payment) {

  const container = document.querySelector(".js-payment-list");

  const maskedCardNumber = (payment?.last16 || "0000").slice(-4);

  container.insertAdjacentHTML(
    "beforeend",
    `
      <div class="payment-card" data-id="${payment.id}">

        ${payment.isDefault ? `
          <p class="default-badge">
            Default Payment Method
          </p>
        ` : ""}

        <h3>${payment.cardType}</h3>

        <p>•••• •••• •••• ${maskedCardNumber}</p>

        <p>Expires ${payment.expiry}</p>

        <button class="js-edit-payment">Edit</button>

        ${!payment.isDefault ? `
          <button class="js-set-default">
            Set as Default
          </button>
        ` : ""}

        <button class="js-delete-payment">
          Remove
        </button>

      </div>
    `
  );
}

function loadPayments() {
  let payments = getPayments();

  if (payments.length === 0) {
    return;
  }

  payments = payments.map((payment, index) => ({
    ...payment,
    isDefault:
      payment.isDefault !== undefined
        ? payment.isDefault
        : index === 0
  }));

  savePayments(payments);

  document.querySelector(".empty-state")?.remove();

  payments.forEach(payment => {
    renderPaymentCard(payment);
  });
}

function handlePaymentActions(event) {
  const card = event.target.closest(".payment-card");
  if (!card) return;

  const paymentId = card.dataset.id;
  if (!paymentId) {
    console.error("No payment ID found");
    return;
  }

  let payments = getPayments();

  // DELETE 
  if (event.target.classList.contains("js-delete-payment")) {
    payments = payments.filter(
      payment => payment.id !== paymentId
    );

    // if deleted default card
    if (
      payments.length > 0 &&
      !payments.some(payment => payment.isDefault)
    ) {
      payments[0].isDefault = true;
    }

    savePayments(payments);

    console.log("DELETE ID:", paymentId);

    refreshPayments();
    return;
  }

  if (event.target.classList.contains("js-edit-payment")) {
    const payments = getPayments();

    const payment = payments.find(
      payment => payment.id === paymentId
    );

    if (!payment) return;

    document.querySelector(".js-card-type").value =
      payment.cardType;

    document.querySelector(".js-card-name").value =
      payment.cardName;

    document.querySelector(".js-last16").value =
      payment.last16;

    document.querySelector(".js-expiry").value =
      payment.expiry;

    document.querySelector(".js-cvv").value =
      payment.cvv;

    document.querySelector(".js-billing-zip").value =
      payment.billingZip;

    editingPaymentId = payment.id;

    document.querySelector(".js-payment-form")
      ?.classList.remove("hidden");

    return;
  }

  // SET DEFAULT
  if (event.target.classList.contains("js-set-default")) {
    payments = payments.map(payment => ({
      ...payment,
      isDefault: payment.id === paymentId
    }));

    savePayments(payments);
    refreshPayments();
  }
}

function refreshPayments() {
  const container = document.querySelector(".js-payment-list");

  container.innerHTML = `
    <div class="payment-form js-payment-form hidden">

      <input type="text" class="js-card-type"
        placeholder="Card Type (Visa, Mastercard...)">

      <input type="text" class="js-card-name"
      placeholder="Name on Card">

      <input type="text" class="js-last16"
        maxlength="16" placeholder="Card Number">

      <input type="text" class="js-expiry"
        placeholder="MM/YY">

      <input type="text" class="js-cvv"
        maxlength="4" placeholder="CVV">

       <input type="text" class="js-billing-zip"
      placeholder="Billing ZIP Code">

      <button class="js-save-payment">
        Save Payment Method
      </button>
    </div>
  `;

  document.querySelector(".js-save-payment")
    ?.addEventListener("click", savePaymentMethod);

  const payments = getPayments();

  if (payments.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<p class="empty-state">No payment methods added yet.</p>`
    );
    return;
  }

  payments.forEach(payment => {
    renderPaymentCard(payment);
  });
}

import { API_BASE_URL } from "../config.js";
import { auth } from "../auth/authStore.js";

console.log("Payment Method Loaded")

let editingPaymentId = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadPayments();

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

    editingPaymentId = null;

    document.querySelector(".js-card-type").value = "";
    document.querySelector(".js-card-name").value = "";
    document.querySelector(".js-last16").value = "";
    document.querySelector(".js-expiry").value = "";
    document.querySelector(".js-cvv").value = "";
    document.querySelector(".js-billing-zip").value = "";

    form.classList.toggle("hidden");
  });

async function savePaymentMethod() {
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

  if (editingPaymentId) {
    const res = await fetch(
      `${API_BASE_URL}/profile/payments/${editingPaymentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          cardType,
          cardName,
          last16,
          expiry,
          cvv,
          billingZip
        })
      }
    );

    if (!res.ok) {
      alert("Failed to update payment");
      return;
    }

    editingPaymentId = null;

  } else {
    const res = await fetch(
      `${API_BASE_URL}/profile/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          cardType,
          cardName,
          last16,
          expiry,
          cvv,
          billingZip
        })
      }
    );

    if (!res.ok) {
      alert("Failed to save payment");
      return;
    }
  }

  document.querySelector(".empty-state")?.remove();

  document.querySelector(".js-card-type").value = "";
  document.querySelector(".js-card-name").value = "";
  document.querySelector(".js-last16").value = "";
  document.querySelector(".js-expiry").value = "";
  document.querySelector(".js-cvv").value = "";
  document.querySelector(".js-billing-zip").value = "";


  await refreshPayments();
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

async function loadPayments() {
  try {

    const res = await fetch(
      `${API_BASE_URL}/profile/payments`,
      {
        headers: {
          "Authorization": `Bearer ${auth.getToken()}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load payments");
    }

    const payments = await res.json();
    console.log(payments)

    const container = document.querySelector(".js-payment-list");

    container.querySelectorAll(".payment-card")
      .forEach(card => card.remove());

    document.querySelector(".empty-state")?.remove();

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

  } catch (error) {
    console.error("Load payments failed:", error);
  }
}

async function handlePaymentActions(event) {
  const card = event.target.closest(".payment-card");
  if (!card) return;

  const paymentId = card.dataset.id;
  if (!paymentId) {
    console.error("No payment ID found");
    return;
  }

  // DELETE 
  if (event.target.classList.contains("js-delete-payment")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/payments/${paymentId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await refreshPayments();

    } catch (error) {
      console.error(error);
    }
    return;
  }

  // EDIT
  if (event.target.classList.contains("js-edit-payment")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/payments`,
        {
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch payments");
      }

      const payments = await res.json();

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

    } catch (error) {
      console.error(error);
    }
    return;
  }

  // SET DEFAULT
  if (event.target.classList.contains("js-set-default")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/payments/${paymentId}/default`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Set default failed");
      }

      await refreshPayments();

    } catch (error) {
      console.error(error);
    }
  }
}

async function refreshPayments() {
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

  await loadPayments();
}

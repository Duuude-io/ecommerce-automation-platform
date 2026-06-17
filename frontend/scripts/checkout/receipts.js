import { getProduct, loadProductsFetch } from "../../data/products.js";

const API_BASE_URL = "https://ecommerce-automation-platform-2.onrender.com";

const receiptContent =
  document.getElementById("receiptContent");

const params = new URLSearchParams(window.location.search);

const orderId = params.get("orderId");

console.log(orderId);

loadReceipt();

async function loadReceipt() {

  if (!orderId) {
    receiptContent.innerHTML =
      "<p>Missing order ID</p>";

    return;
  }

  try {

    await loadProductsFetch();

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/receipt`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load receipt");
    }

    const receipt = await response.json();

    console.log(receipt);


    console.log("subtotal:", receipt.subTotalCents);
    console.log("shipping:", receipt.shippingCents);
    console.log("tax:", receipt.taxCents);
    console.log("total:", receipt.total);

    renderReceipt(receipt);

  } catch (error) {

    console.error(error);

    receiptContent.innerHTML = `
      <p>Failed to load receipt</p>
    `;
  }
}

function renderReceipt(receipt) {

  const itemsHtml = receipt.items.map(item => {

    const product = getProduct(item.productId);

    return `
      <div class="receipt-section item-row">

        <div class="item-info">
          <div class="item-name">
            ${product.name}
          </div>

          <div class="item-qty">
            Qty: ${item.quantity}
          </div>
        </div>

        <div class="item-price">
          $${(product.priceCents / 100).toFixed(2)}
        </div>

      </div>
    `;
  }).join('');

  receiptContent.innerHTML = `

    <div class="receipt-section order-number">
      <strong>Order Number:</strong>
      ${receipt.orderNumber}
    </div>

    <div class="receipt-section">
      <strong>Order Date:</strong>
      ${new Date(receipt.createdAt).toLocaleString()}
    </div>

    <div class="broken-divider"></div>

    <div class="receipt-section">
      <div class="address-receipt-section">
        <strong>Shipping Address:</strong>

        <div>
          ${receipt.billingDetails.fullName}
        </div>
        <div>
          ${receipt.billingDetails.apartment}
          ${receipt.billingDetails.streetAddress}
        </div>
        <div>
          ${receipt.billingDetails.city},
          ${receipt.billingDetails.state}
          ${receipt.billingDetails.zipCode}
        </div>
      </div>
    </div>

    <div class="broken-divider"></div>

    <div class="contact-section">
      <div class="receipt-section">
        <strong>Email:</strong>
        ${receipt.email}
      </div>
      <div class="receipt-section">
        <strong>Phone:</strong>
        ${receipt.phone}
      </div>
    </div>

    <div class="broken-divider"></div>

    <div class="receipt-section">
      <div class="item-receipt-section">
        <strong>Items:</strong>
    
        ${itemsHtml}
      </div>
    </div>

    <div class="broken-divider"></div>

    <div class="receipt-section">
      <strong>SubTotal:</strong>
      $${(receipt.subTotalCents / 100).toFixed(2)}
    </div>

    <div class="receipt-section">
      <strong>Tax:</strong>
      <span>
        $${(receipt.taxCents / 100).toFixed(2)}
      </span>
    </div>

    <div class="receipt-section">
      <strong>Shipping:</strong>
      <span>
        $${(receipt.shippingCents / 100).toFixed(2)}
      </span>
    </div>

    <div class="divider-4"></div>

    <div class="receipt-section receipt-total">
      <strong>Total:</strong>
      <span>
        $${(receipt.total / 100).toFixed(2)}
      </span>
    </div>

  `;
}
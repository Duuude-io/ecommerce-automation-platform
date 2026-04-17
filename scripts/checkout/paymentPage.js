import { cart } from '../../data/cart-class.js';
import { renderCheckoutHeader } from './checkoutHeader.js';
import { states } from '../../data/state.js';
import { renderSecureBadge } from '../secureBadge.js';
import { products, getProduct } from '../../data/products.js';
import { deliveryOptions, getDeliveryOption, calculateDeliveryDate } from '../../data/deliveryOptions.js';

document.addEventListener('DOMContentLoaded', () => {

  renderCheckoutHeader();
  renderPaymentSummary(cart);
  renderBillingDetails();
  renderPaymentMethods();

  renderStateList();
  renderSecureBadge();
});

export function renderBillingDetails() {
  const container = document.querySelector('.js-billing-container');

  const paymentHTML = `
    <h2 class="checkout-title">CHECKOUT</h2>

    <h3 class="">Billing Details</h3>
    <p class="required-note">* required information</p>

    <div class="billing-grid">
      <div class="input-group">
        <input type="text" id="firstName" placeholder=" " required>
        <label for="firstName">First Name <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <input type="text" id="lastName" placeholder=" " required>
        <label for="lastName">Last Name <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <input type="text" id="address2" placeholder=" ">
        <label for="address2">Apartment, suite, unit, etc.</label>
      </div>

      <div class="input-group">
        <input type="text" id="address1" placeholder=" " required>
        <label for="address1">Street Address <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <input type="text" id="city" placeholder=" " required>
        <label for="city">Town / City <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <select class="state-select js-state-select" id="state" required>
          <option value="" disabled selected hidden></option>
        </select>
        <label for="state">State <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <input type="text" id="zip" class="zip-input" placeholder=" " maxlength="6" inputmode="numeric" required>
        <label for="zip">Zip <span class="required-star">*</span></label>
      </div>

      <div class="input-group">
        <input type="tel" id="phone" placeholder=" ">
        <label for="phone">Phone</label>
      </div>

      <div class="input-group">
        <input type="email" id="email" placeholder=" " required>
        <label for="email">Email Address <span class="required-star">*</span></label>
      </div>
    </div>

    <hr class="section-divider">
  `;

  container.innerHTML = paymentHTML;
}

function renderPaymentSummary(cart) {
  let html = '';

  cart.cartItems.forEach((cartItem) => {
    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = calculateDeliveryDate(deliveryOption);

    html += `
      <div class="cart-item-container 
        js-cart-item-container
        js-cart-item-container-${matchingProduct.id}">

        <div class="product-name js-product-name-${matchingProduct.id}">
              ${matchingProduct.name}
            </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-price js-product-price-${matchingProduct.id}">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity js-product-quantity-${matchingProduct.id}">
              <span>

              <!-- This code was copied from the solutions of exercises 14f - 14n. -->
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              </span>
               <span class="update-quantity-link link-primary js-update-link"
                data-product-id="${matchingProduct.id}">
                Update
              </span>
            
              <span class="delete-quantity-link link-primary js-delete-link
              js-delete-link-${matchingProduct.id}"
              data-product-id="${matchingProduct.id}">
                Delete🗑️
              </span>

          <div class="delivery-date">
            Delivery date: ${dateString}
          </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.js-order-summary').innerHTML = html;

  attachDeleteEvents();
}

function attachDeleteEvents() {
  document.querySelectorAll('.js-delete-link')
    .forEach((link) => {
      link.addEventListener(('click'), () => {
        const productId = link.dataset.productId;
        cart.removeFromCart(productId);

        renderCheckoutHeader();
        renderPaymentSummary(cart);
      });
    });
}

function renderPaymentMethods() {
  const container = document.querySelector('.js-payment-method')

  if (!container)
    return;

  const html = `
  <div class="payment-card">
    <div class="payment-header-container">
      <div class="payment-header">Choose Payment Method</div>
      <div class="js-secure-badge-container">
      </div>
    </div>

    <div class="payment-methods-group">
      <label class="payment-option-card">
        <div class="option-row">
          <div class="radio-wrapper">
            <input type="radio" name="payment-method" value="card" checked>
            <span class="method-label">Credit or Debit Card</span>
          </div>
          <div class="payment-icons">
            <img src="images/visa-logo-visa-png.webp">
            <img src="images/Verve_Image.png">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard">
          </div>
        </div>

        <div class="card-input-fields">
          <div class="input-group full">
            <input type="text" placeholder="Card Number" class="compact-input">
          </div>
          <div class="payment-card-grid">
            <div class="input-group">
              <input type="text" placeholder="MM / YY" class="compact-input">
            </div>
            <div class="input-group">
              <input type="text" placeholder="CVV" class="compact-input">
            </div>
          </div>
        </div>
      </label>

      <label class="payment-option-card">
        <div class="option-row">
          <div class="radio-wrapper">
            <input type="radio" name="payment-method" value="paypal">
            <span class="method-label">PayPal</span>
          </div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="paypal-icon">
        </div>
      </label>

      <button class="complete-purchase-btn">COMPLETE PURCHASE</button>
    </div>
  `;

  container.innerHTML = html;

  renderSecureBadge();
}

function renderStateList() {
  const stateSelect = document.querySelector('.js-state-select');

  if (!stateSelect) {
    console.error("HTML element .js-state-select not found!");
    return;
  }

  // Debug: Let's see if the data actually arrived
  console.log("States array content:", states);

  let statesHTML = '<option value="" disabled selected hidden></option>';

  // Check if states exists and has items
  if (states && states.length > 0) {
    states.forEach((state) => {
      statesHTML += `<option value="${state.abbrev}">${state.name}</option>`;
    });

    stateSelect.innerHTML = statesHTML;
    console.log("Successfully injected states!");
  } else {
    console.error("The states array is empty. Check your data/state.js file.");
  }
}

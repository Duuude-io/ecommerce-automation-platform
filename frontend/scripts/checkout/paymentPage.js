import { cart } from '../../data/cart-class.js';
import { renderCheckoutHeader } from './checkoutHeader.js';
import { states } from '../../data/state.js';
import { renderSecureBadge } from '../secureBadge.js';
import { products, getProduct, loadProductsFetch } from '../../data/products.js';
import { deliveryOptions, getDeliveryOption, calculateDeliveryDate } from '../../data/deliveryOptions.js';
import { renderSecureLogo } from '../secureLogo.js';
import { createOrder, buildOrderData } from '../../data/ordersApi.js';
import { calculateCartTotal } from './paymentEvents.js';

document.addEventListener('DOMContentLoaded', initPaymentPage);

async function initPaymentPage() {

  // laods product first
  await loadProductsFetch();

  // then render UI
  renderCheckoutHeader();
  renderPaymentSummary(cart);
  renderBillingDetails();
  renderPaymentMethods();

  //setup logic after html exists
  attachEventListeners();
  initPaymentLogic();
  renderYears();
  renderStateList();
  renderSecureBadge();
};

export function renderBillingDetails() {
  const container = document.querySelector('.js-billing-container');

  const paymentHTML = `
  <div class="checkout-title-container">
      <h2 class="checkout-title">CHECK'N-OUT</h2>

      <h3 class="billing-details-header">Billing Details</h3>
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
    </div>
    
    <hr class="section-divider">
  `;

  container.innerHTML = paymentHTML;
}

function renderPaymentSummary(cart) {
  let html = `
    <div class="your-items-header">
      Your Items
    </div>
  `;

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
        
        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

        <div class="product-name js-product-name-${matchingProduct.id}">
            ${matchingProduct.name}
          </div>

          <div class="cart-item-details">
            <div class="product-price js-product-price-${matchingProduct.id}">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity js-product-quantity-${matchingProduct.id}">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              </span>
               <span class="update-quantity-link link-primary js-update-link"
                data-product-id="${matchingProduct.id}">
                Updt🛒
              </span>
            
              <span class="delete-quantity-link link-primary js-delete-link
              js-delete-link-${matchingProduct.id}"
              data-product-id="${matchingProduct.id}">
                Del...🗑️
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
      <label class="payment-option-paypal">
        <div class="option-row">
          <div class="radio-wrapper">
            <input type="radio" name="payment-method" value="paypal">
            <span class="method-label"></span>
          </div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="paypal-icon">
         </div>
        </div>
      </label>

    <div class="payment-methods-group">
      <label class="payment-option-card">
        <div class="option-row">
          <div class="radio-wrapper">
            <input type="radio" name="payment-method" value="card" checked>
            <span class="method-label">Credit or Debit Card</span>
          </div>

          <div class="payment-icons">
            <img src="images/master-card-2.png" alt="Mastercard">
            <img src="images/visa-logo-visa-png.webp">
            <img src="images/verve-card-3.png">
          </div>
        </div>
      </label>
      

      <div class="card-input-fields js-card-form">

        <div class="input-group">
          <div class="payment-header-payment">
            <div class="payment-title">Payment</div>
            
            <div class="js-secure-badge-container"></div>
          </div>
        <div class="card-number-block">Card Number <span class="required-star">*</span>
        </div>

        <div class="card-input-wrapper">
          <img src="images/credit-card.png" class="input-icon-left" alt="card icon">
          <img src="images/padlock.png"
          class="input-icon-right" alt="card icon">
          <input type="text" class="compact-input">
          <div class="payment-note">
            Pay with your MasterCard, Visa, Discover or American Express
          </div>
        </div>
    
        <div class="card-number-block">
          Expiration Date <span class="required-star">*</span>
        </div>
          <div class="payment-card-grid">
            <div class="input-group"> 
              <select id="expiryMonth" 
                class="compact-input-2 js-month-select" required>
                <option value="" selected>Month</option>
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05">05</option>
                <option value="06">06</option>
                <option value="07">07</option>
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
            </div>

            <div class="input-group">
              <select class="compact-input-2 js-year-select" required>
                <option value="" selected>Year</option>
              </select>
            </div>
          </div>

        <div class="card-cvv-block">
          Card Security Code <span class="required-star">*</span>
        </div>
          <div class="input-group-payment">
            
            <input type="text" placeholder="CVV" class="compact-input-3">
              <img src="images/shopping.png" class="payment-icons" alt="card icon">
            </div>
          <div class="secure-payment-note">
            <p class="payment-note-2">
              Your information is secure.
            </p>

            <span class="secure-logo-wrapper">
              <span class="js-secure-logo">
                ${renderSecureLogo()}
              </span>

              <span class="secure-tooltip">
                Payments are encrypted with SSL security.
              </span>
            </span>
          </div>
        </div>

      </div>

      <button class="complete-purchase-btn button-primary
       js-complete-purchase-button">
        COMPLETE PURCHASE
      </button>
    </div>
  `;

  container.innerHTML = html;

  renderSecureBadge();
}

function renderYears() {
  const yearSelect = document.querySelector('.js-year-select');

  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 15; i++) {
    const year = currentYear + i;

    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;

    yearSelect.appendChild(option);
  }
}

function renderStateList() {
  const stateSelect = document.querySelector('.js-state-select');

  if (!stateSelect) {
    console.error("HTML element .js-state-select not found!");
    return;
  }

  console.log("States array content:", states);

  let statesHTML = '<option value="" disabled selected hidden></option>';

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

function initPaymentLogic() {

  const paymentRadios =
    document.querySelectorAll('input[name="payment-method"]');

  const cardForm =
    document.querySelector('.js-card-form');

  if (!paymentRadios.length || !cardForm) return;

  function toggleCardForm() {

    const selected =
      document.querySelector('input[name="payment-method"]:checked');

    if (!selected) return;

    if (selected.value === 'card') {
      cardForm.classList.remove('hidden');
    } else {
      cardForm.classList.add('hidden');
    }
  }

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', toggleCardForm);
  });

  toggleCardForm();
}

function attachEventListeners() {
  const button = document.querySelector('.js-complete-purchase-button');

  if (!button) return;

  button.addEventListener('click', handleCompletePurchase);
}

function getBillingDetails() {
  return {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    apartment: document.getElementById('address2').value,
    streetAddress: document.getElementById('address1').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zipCode: document.getElementById('zip').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  };
}

async function handleCompletePurchase() {

  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please create an account or login before placing an order.');

    // redirect to login page
    window.location.href = 'login.html';
    return;
  }

  console.log('cart items before order:', cart.cartItems)

  if (cart.cartItems.length === 0) {
    alert('Your cart is empty');
    return;
  }

  try {
    const billingDetails = getBillingDetails();

    const orderData = buildOrderData(
      cart.cartItems,
      billingDetails,
      calculateCartTotal()
    );

    console.log('sending order:', orderData)

    const result = await createOrder(orderData);

    console.log('Order created:', result);

    cart.resetCart();

    window.location.href = 'orders.html';

  } catch (error) {
    console.error('Order failed:', error);
    alert('Something went wrong placing your order.');
  }
}
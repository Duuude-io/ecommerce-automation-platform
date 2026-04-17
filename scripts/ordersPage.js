import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { orders, cancelOrder } from '../data/orders.js';
import { cart } from '../data/cart-class.js';
import { formatCurrency } from './utils/money.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
window.testOrders = orders;

async function loadPage() {
  console.log('1. Starting loadPage');

  await loadProductsFetch();
  console.log('2. Orders array:', orders); // Is this [] or does it have data?

  let ordersHTML = '';

  if (orders.length === 0) {
    ordersHTML = `
      <div class="empty-orders-container">
        <div class="empty-orders-message">
          You haven't placed any orders yet.
        </div>
        <a class="button-primary view-products-link" href="amazon.html">
          Start Shopping
        </a>
      </div>
    `;
  } else {

    orders.forEach((order) => {
      console.log('3. Rendering order:', order.id);
      const orderDate = dayjs(order.orderTime).format('MMMM D');

      ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${orderDate}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatCurrency(order.totalCostCents)}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          <button class="cancel-order-button button-secondary js-cancel-order" data-order-id="${order.id}">
            Cancel Order
          </button>
          </div>
        </div>
        <div class="order-details-grid">
          ${renderOrderItems(order)}
        </div>
      </div>
    `;
    });
  }

  const ordersGrid = document.querySelector('.js-orders-grid');
  if (ordersGrid) {
    ordersGrid.innerHTML = ordersHTML;
  }

  document.querySelectorAll('.js-cancel-order').forEach((button) => {
    button.addEventListener('click', () => {
      const orderId = button.dataset.orderId;
      cancelOrder(orderId);
      window.location.reload();
    });
  });

  document.querySelectorAll('.js-buy-again-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;

      cart.addToCart(productId);

      button.innerHTML = 'Added!';

      setTimeout(() => {
        window.location.href = 'checkout.html';
      }, 500);
    });
  });

  updateCartQuantity();
}

function renderOrderItems(order) {
  let itemsHTML = '';
  if (!order.products) return '';

  order.products.forEach((productDetails) => {
    const product = getProduct(productDetails.productId);
    if (!product) return;

    itemsHTML += `
      <div class="product-image-container">
        <img src="${product.image}">
      </div>
      <div class="product-details">
        <div class="product-name">${product.name}</div>
        <div class="product-delivery-date">
          Arriving on: ${dayjs(productDetails.estimatedDeliveryTime).format('MMMM D')}
        </div>
        <div class="product-quantity">Quantity: ${productDetails.quantity}</div>
        <button class="buy-again-button button-primary js-buy-again-button" data-product-id="${product.id}">
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        </button>
      </div>
      <div class="product-actions">
        <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
          <button class="track-package-button button-secondary">Track package</button>
        </a>
      </div>
    `;
  });
  return itemsHTML;
}

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.cartItems.forEach((item) => { cartQuantity += item.quantity; });
  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  if (cartQuantityElement) {
    cartQuantityElement.innerHTML = cartQuantity;
  }
}

loadPage();

const usStates = [
  { name: 'Alabama', abbrev: 'AL' }, { name: 'Alaska', abbrev: 'AK' },
  { name: 'Arizona', abbrev: 'AZ' }, { name: 'Arkansas', abbrev: 'AR' },
  { name: 'California', abbrev: 'CA' }, { name: 'Colorado', abbrev: 'CO' },
  { name: 'Connecticut', abbrev: 'CT' }, { name: 'Delaware', abbrev: 'DE' },
  { name: 'Florida', abbrev: 'FL' }, { name: 'Georgia', abbrev: 'GA' },
  { name: 'Hawaii', abbrev: 'HI' }, { name: 'Idaho', abbrev: 'ID' },
  { name: 'Illinois', abbrev: 'IL' }, { name: 'Indiana', abbrev: 'IN' },
  { name: 'Iowa', abbrev: 'IA' }, { name: 'Kansas', abbrev: 'KS' },
  { name: 'Kentucky', abbrev: 'KY' }, { name: 'Louisiana', abbrev: 'LA' },
  { name: 'Maine', abbrev: 'ME' }, { name: 'Maryland', abbrev: 'MD' },
  { name: 'Massachusetts', abbrev: 'MA' }, { name: 'Michigan', abbrev: 'MI' },
  { name: 'Minnesota', abbrev: 'MN' }, { name: 'Mississippi', abbrev: 'MS' },
  { name: 'Missouri', abbrev: 'MO' }, { name: 'Montana', abbrev: 'MT' },
  { name: 'Nebraska', abbrev: 'NE' }, { name: 'Nevada', abbrev: 'NV' },
  { name: 'New Hampshire', abbrev: 'NH' }, { name: 'New Jersey', abbrev: 'NJ' },
  { name: 'New Mexico', abbrev: 'NM' }, { name: 'New York', abbrev: 'NY' },
  { name: 'North Carolina', abbrev: 'NC' }, { name: 'North Dakota', abbrev: 'ND' },
  { name: 'Ohio', abbrev: 'OH' }, { name: 'Oklahoma', abbrev: 'OK' },
  { name: 'Oregon', abbrev: 'OR' }, { name: 'Pennsylvania', abbrev: 'PA' },
  { name: 'Rhode Island', abbrev: 'RI' }, { name: 'South Carolina', abbrev: 'SC' },
  { name: 'South Dakota', abbrev: 'SD' }, { name: 'Tennessee', abbrev: 'TN' },
  { name: 'Texas', abbrev: 'TX' }, { name: 'Utah', abbrev: 'UT' },
  { name: 'Vermont', abbrev: 'VT' }, { name: 'Virginia', abbrev: 'VA' },
  { name: 'Washington', abbrev: 'WA' }, { name: 'West Virginia', abbrev: 'WV' },
  { name: 'Wisconsin', abbrev: 'WI' }, { name: 'Wyoming', abbrev: 'WY' }
];

// Logic to render them into the HTML
const stateListContainer = document.querySelector('.js-state-list');
let html = '';

usStates.forEach((state) => {
  html += `<li data-value="${state.abbrev}">${state.name}</li>`;
});

stateListContainer.innerHTML = html;
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
        <button class="buy-again-button button-primary" data-product-id="${product.id}">
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

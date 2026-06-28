import { cart } from '../../data/cart-class.js';

export function renderCheckoutHeader() {
  let cartQuantity = 0;

  cart.cartItems.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  const checkoutHeaderHTML = `
    <div class="header-content">
      <div class="checkout-header-left-section">
        <a href="index.html">
          <img class="dydx-logo" src="images/DyDx_Logo_(2).gif">
          <img class="dydx-mobile-logo" src="images/DyDx_Logo_(2).gif">
        </a>
      </div>
      <div class="checkout-header-middle-section">
        Checkout (<a class="return-to-home-link"
          href="index.html">${cartQuantity} items</a>)
      </div>
      <div class="checkout-header-right-section">
        <img src="images/icons/checkout-lock-icon.png">
      </div>
    </div>
  `;

  document.querySelector('.js-checkout-header')
    .innerHTML = checkoutHeaderHTML;
} 
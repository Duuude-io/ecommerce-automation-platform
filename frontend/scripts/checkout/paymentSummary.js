import { cart } from '../../data/cart-class.js';
import { getProduct, products } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { getDefaultPayment } from "../paymentStore.js";
import { formatCurrency } from '../utils/money.js';
import { createOrder } from '../../data/ordersApi.js';

export function renderPaymentSummary() {

  let productPriceCents = 0;
  let cartQuantity = 0;

  cart.cartItems.forEach((cartItem) => {

    cartQuantity += cartItem.quantity

    const product = getProduct(cartItem.productId);

    if (!product) {
      console.warn('product missing:', cartItem.productId);
      return '';
    }

    productPriceCents +=
      product.priceCents * cartItem.quantity;
  });

  const selectedDeliveryOption = getDeliveryOption(cart.cartItems[0]?.deliveryOptionId || '1');

  const shippingPriceCents = selectedDeliveryOption.priceCents;

  console.log({
    deliveryOption: selectedDeliveryOption.id,
    shippingPriceCents
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;

  const payment = getDefaultPayment();
  const maskedCardNumber = (payment?.last16 || "0000").slice(-4);

  const paymentHTML = payment ? `
    <div class="payment-method-preview">
      <h3>Payment Method</h3>
      <p>${payment.cardType}</p>
      <p>**** **** **** ${maskedCardNumber}</p>
    </div>
    
  `
    : `
    <div class="payment-method-preview">
      <h3>Payment Method</h3>
      <p>No payment method selected</p>
    </div>
  `;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${cartQuantity}):</div>
      <div class="payment-summary-money">
        $${formatCurrency(productPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money js-payment-summary-shipping">
        $${formatCurrency(shippingPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalBeforeTaxCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">
        $${formatCurrency(taxCents)}
      </div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money js-payment-summary-total">
        $${formatCurrency(totalCents)}
      </div>
    </div>

    ${paymentHTML}

    <button class="place-order-button button-primary
      js-place-order">
      Make Payments
    </button>
  `;

  document.querySelector('.js-payment-summary')
    .innerHTML = paymentSummaryHTML;

  document.querySelector('.js-place-order')
    .addEventListener('click', async () => {
      // 1. CHECK IF THE CART IS EMPTY
      if (cart.cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      window.location.href = 'check-out-pages/billdetailspage.html';
    });
}

export function getCartTotals() {
  let productPriceCents = 0;
  let cartQuantity = 0;

  cart.cartItems.forEach(cartItem => {
    console.log("cartItem:", cartItem);

    const product = getProduct(cartItem.productId);
    console.log("product:", product);
    if (!product) return;

    cartQuantity += cartItem.quantity;
    productPriceCents +=
      product.priceCents * cartItem.quantity;
  });

  console.log("cart:", cart.cartItems);

  const selectedDeliveryOption =
    getDeliveryOption(
      cart.cartItems[0]?.deliveryOptionId || "1"
    );

  const shippingPriceCents =
    selectedDeliveryOption.priceCents;

  const totalBeforeTaxCents =
    productPriceCents + shippingPriceCents;

  const taxCents =
    totalBeforeTaxCents * 0.1;

  const totalCents =
    totalBeforeTaxCents + taxCents;

  console.log({
    productPriceCents,
    shippingPriceCents,
    totalCents
  });

  return {
    cartQuantity,
    productPriceCents,
    shippingPriceCents,
    taxCents,
    totalCents
  };
}
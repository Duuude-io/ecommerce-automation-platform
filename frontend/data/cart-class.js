import { auth } from "../scripts/auth/authStore.js";
import { API_BASE_URL } from "../scripts/config.js";

class Cart {
  cartItems;
  #localStorageKey;

  constructor(localStorageKey) {
    this.#localStorageKey = localStorageKey;
    this.cartItems = [];
  }

  async loadFromBackend() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cart`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load cart");
      }

      const data = await response.json();

      console.log("BACKEND CART RESPONSE:", data);

      this.cartItems = data.items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        deliveryOptionId: item.delivery_option_id
      }));

      console.log("cart loaded:", this.cartItems);

    } catch (error) {
      console.log("Failed to load cart:", error);
      this.cartItems = [];
    }
  }

  saveToStorage() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.cartItems));
  }

  resetCart() {
    this.cartItems = [];
    this.saveToStorage();
  }

  addToCart(productId, quantity = 1) {
    let matchingItem;

    this.cartItems.forEach((cartItem) => {
      if (productId === cartItem.productId) {
        matchingItem = cartItem;
      }
    });

    if (matchingItem) {
      matchingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        productId: productId,
        quantity: quantity,
        deliveryOptionId: '1'
      });
    }

    this.saveToStorage();
  }

  // this for your "Update" button on checkout
  updateQuantity(productId, newQuantity) {
    let matchingItem;

    this.cartItems.forEach((cartItem) => {
      if (productId === cartItem.productId) {
        matchingItem = cartItem;
      }
    });

    if (matchingItem) {
      matchingItem.quantity = newQuantity;

      this.saveToStorage();
    }
  }

  removeFromCart(productId) {
    const newCart = [];

    this.cartItems.forEach((cartItem) => {
      if (cartItem.productId !== productId) {
        newCart.push(cartItem);
      }
    });

    this.cartItems = newCart;

    this.saveToStorage();
  }

  updateAllDeliveryOptions(deliveryOptionId) {

    if (
      deliveryOptionId !== '1' &&
      deliveryOptionId !== '2' &&
      deliveryOptionId !== '3'
    ) {
      return;
    }

    this.cartItems.forEach(cartItem => {
      cartItem.deliveryOptionId = deliveryOptionId;
    });

    this.saveToStorage();
  }

  updateDeliveryOption(productId, deliveryOptionId) {
    if (deliveryOptionId !== '1' && deliveryOptionId !== '2' && deliveryOptionId !== '3') {
      return;
    }

    let matchingItem;

    this.cartItems.forEach((cartItem) => {
      if (productId === cartItem.productId) {
        matchingItem = cartItem;
      }
    });

    // 2. Safety Check (This prevents crashes)
    if (matchingItem) {
      matchingItem.deliveryOptionId = deliveryOptionId;
      this.saveToStorage();
    }
  }
}

export const cart = new Cart('cart-oop');
const businessCart = new Cart('cart-business');

console.log(cart);
console.log(businessCart);
console.log(businessCart instanceof Cart);

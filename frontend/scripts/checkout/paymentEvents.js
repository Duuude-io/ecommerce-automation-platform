import { cart } from '../../data/cart-class.js';
import { getProduct } from '../../data/products.js';

export function calculateCartTotal() {
  return cart.cartItems.reduce((total, cartItem) => {
    const product = getProduct(cartItem.productId);
    return total + product.priceCents * cartItem.quantity;
  }, 0);
}
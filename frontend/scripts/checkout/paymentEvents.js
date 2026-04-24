import { cart } from '../../data/cart-class.js';
import { getProduct } from '../../data/products.js';

export function calculateCartTotal() {
  return cart.cartItems.reduce((total, item) => {
    const product = getProduct(item.productId);
    return total + product.priceCents * item.quantity;
  }, 0);
}
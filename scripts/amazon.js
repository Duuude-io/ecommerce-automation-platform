import { cart } from '../data/cart-class.js';
import { products, loadProducts } from '../data/products.js';
import { formatCurrency } from './utils/money.js';

loadProducts(renderProductsGrid);

function renderProductsGrid() {
  let productsHTML = '';

  const url = new URL(window.location.href);
  const search = url.searchParams.get('search');

  let filteredProducts = products;

  if (search) {
    filteredProducts = products.filter((product) => {
      let matchingKeyword = false;

      // Check keywords first
      product.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(search.toLowerCase())) {
          matchingKeyword = true;
        }
      });

      // Return true if name OR keywords match
      return matchingKeyword || product.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  filteredProducts.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}">
        </div>
        <div class="product-name limit-text-to-2-lines">${product.name}</div>
        <div class="product-rating-container">
          <img class="product-rating-stars" src="${product.getStarsUrl()}">
          <div class="product-rating-count link-primary">${product.rating.count}</div>
        </div>
        <div class="product-price">${product.getPrice()}</div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector-${product.id}">
            <option selected value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        ${product.extraInfoHTML()}

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png"> Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  });

  document.querySelector('.js-products-grid').innerHTML = productsHTML;

  // Update the quantity as soon as the page renders
  updateCartQuantity();

  function updateCartQuantity() {
    let cartQuantity = 0;

    cart.cartItems.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
    const cartQuantityElement = document.querySelector('.js-cart-quantity');
    if (cartQuantityElement) {
      cartQuantityElement.innerHTML = cartQuantity;
    }
  }

  // Object to keep track of timeouts for each product
  const addedMessageTimeouts = {};

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;

      // ✅ Now we get the quantity properly inside the click event
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = Number(quantitySelector.value);

      cart.addToCart(productId, quantity); // Pass the quantity if your function supports it
      updateCartQuantity();

      // --- ADDED MESSAGE LOGIC START ---
      const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);

      // Make the message visible
      addedMessage.classList.add('added-to-cart-visible');

      // Check if there's an existing timeout for this product and clear it
      const previousTimeoutId = addedMessageTimeouts[productId];
      if (previousTimeoutId) {
        clearTimeout(previousTimeoutId);
      }

      // Hide the message after 2 seconds and store the timeout ID
      const timeoutId = setTimeout(() => {
        addedMessage.classList.remove('added-to-cart-visible');
      }, 2000);

      addedMessageTimeouts[productId] = timeoutId;
      // --- ADDED MESSAGE LOGIC END ---

    });
  });
}

// Search Logic
const performSearch = () => {
  const searchBar = document.querySelector('.js-search-bar');
  if (searchBar) {
    const search = searchBar.value;
    window.location.href = `amazon.html?search=${search}`;
  }
};

// Check if search button exists before adding listener
const searchButton = document.querySelector('.js-search-button');
if (searchButton) {
  searchButton.addEventListener('click', performSearch);
}

// Check if search bar exists before adding listener
const searchInput = document.querySelector('.js-search-bar');
if (searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performSearch();
  });
}
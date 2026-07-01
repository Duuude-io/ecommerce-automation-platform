import { formatCurrency } from '../scripts/utils/money.js';
import { API_BASE_URL } from '../scripts/config.js';

export function getProduct(productId) {
  let matchingProduct;

  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  return matchingProduct;
}

export class Product {
  id;
  sku;
  name;
  brand;
  category;
  image;
  images;
  rating;
  priceCents;
  originalPriceCents;
  discountPercent;
  stock;
  description;
  specs;
  featured;
  createdAt;
  sizeChartLink;
  instructionsLink;
  warrantyLink;
  keywords;


  constructor(data) {
    this.id = data.id;
    this.sku = data.sku || `SKU-${data.id.slice(0, 8)}`;
    this.name = data.name;
    this.brand = data.brand || "";
    this.category = data.category || "general";

    this.image = data.image || "";
    this.images =
      data.images || (data.image ? [data.image] : []);
    this.rating = data.rating || {
      stars: 0,
      count: 0
    };

    this.priceCents = data.priceCents;

    this.originalPriceCents =
      data.originalPriceCents ?? data.priceCents;
    this.createdAt =
      data.createdAt ?? new Date().toISOString();

    this.discountPercent = data.discountPercent ?? 0;
    this.stock = data.stock ?? 0;
    this.description = data.description || "";
    this.specs = data.specs || {};
    this.featured = data.featured ?? false;

    this.sizeChartLink = data.sizeChartLink || "";
    this.instructionsLink = data.instructionsLink || "";
    this.warrantyLink = data.warrantyLink || "";
    this.keywords = data.keywords || [];
  }

  getStarsUrl() {
    return `images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  getPrice() {
    return `$${formatCurrency(this.priceCents)}`;
  }

  extraInfoHTML() {
    let html = '';

    if (this.sizeChartLink) {
      html += `
        <a href="${this.sizeChartLink}" target="_blank">
          Size chart
        </a>
      `;
    }

    if (this.instructionsLink) {
      html += `
        <a href="${this.instructionsLink}" target="_blank">
          Instructions
        </a>
      `;
    }

    if (this.warrantyLink) {
      html += `
        <a href="${this.warrantyLink}" target="_blank">
          Warranty
        </a>
      `;
    }

    return html;
  }
}




/*
const date = new Date();
console.log(date);
console.log(date.toLocaleTimeString());
*/

/*
console.log(this);

const object2 = {
  a: 2,
  b: this.a
};
*/

/*
function logThis() {
  console.log(this);
}
logThis();
logThis.call('hello');

this
const object3 = {
  method: () => {
    console.log(this);
  }
};
object3.method();
*/

export let products = [];

export function loadProductsFetch() {
  const promise = fetch(
    `${API_BASE_URL}/products`
  ).then((response) => {
    return response.json();
  }).then((productsData) => {
    products = productsData.map((productDetails) => {

      return new Product(productDetails);
    });

    console.log('load products');
  }).catch((error) => {
    console.log('Unexpected error. Please try again later.');
  });

  return promise;
}
/*
loadProductsFetch().then(() => {
  console.log('next step');
});
*/

export function loadProducts(fun) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    products = JSON.parse(xhr.response).map((productDetails) => {
      return new Product(productDetails);
    });

    console.log('load products');

    fun();
  });

  xhr.addEventListener('error', (error) => {
    console.log('Unexpected error. Please try again later.');
  });

  xhr.open('GET', `${API_BASE_URL}/products`);
  xhr.send();
}

import { fetchOrders } from '../data/ordersApi.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

async function loadPage() {
  await loadProductsFetch();

  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  const productId = url.searchParams.get('productId');

  const orders = await fetchOrders();

  const order = orders.find(order => order.id === orderId);
  const product = getProduct(productId);

  if (!order || !product) {
    console.error('Order or product not found');
    return;
  }

  // Get additional details about the product like
  // the estimated delivery time.
  let productDetails;
  order.items.forEach((details) => {
    if (details.productId === product.id) {
      productDetails = details;
    }
  });

  const today = dayjs();
  const orderTime = dayjs(order.orderTime);
  const deliveryTime = dayjs(productDetails.estimatedDeliveryTime);
  const percentProgress = ((today - orderTime) / (deliveryTime - orderTime)) * 100;

  // Extra feature: display "delivered" on the tracking page
  // if today's date is past the delivery date.
  const deliveredMessage = today < deliveryTime ? 'Arriving on' : 'Delivered on';

  const trackingHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>

    <div class="delivery-date">
      Arriving on 
     ${deliveredMessage} ${dayjs(productDetails.estimatedDeliveryTime).format('dddd, MMMM D')
    }
    </div>

    <div class="product-info">
      ${product.name}
    </div>

    <div class="product-info">
      Quantity: ${productDetails.quantity}
    </div>

    <img class="product-image" src="${product.image}">

    <div class="progress-labels-container">
      <div class="progress-label ${percentProgress < 50 ? 'current-status' : ''
    }">
        Preparing
      </div>
      <div class="progress-label ${(percentProgress >= 50 && percentProgress < 100) ? 'current-status' : ''
    }">
        Shipped
      </div>
      <div class="progress-label ${percentProgress >= 100 ? "current-status" : ''
    }">
        Delivered
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${percentProgress}%;"></div>
    </div>
  `;

  document.querySelector('.js-order-tracking').innerHTML = trackingHTML;
}

loadPage();
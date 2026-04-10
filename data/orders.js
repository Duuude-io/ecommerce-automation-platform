export let orders = JSON.parse(localStorage.getItem('orders')) || [];

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

export function getOrder(orderId) {
  let matchingOrder;

  orders.forEach((order) => {
    if (order.id === orderId) {
      matchingOrder = order;
    }
  });

  return matchingOrder;
}

export function cancelOrder(orderId) {
  // Use a loose inequality and check for 'undefined' as a string
  // to catch the broken "undefined" orders.
  orders = orders.filter((order) => {
    return order.id !== orderId && order.id !== undefined && order.id !== 'undefined';
  });

  saveToStorage();
}
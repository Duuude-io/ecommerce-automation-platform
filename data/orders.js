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
  // 2. Update the 'orders' variable by filtering it
  orders = orders.filter((order) => order.id !== orderId);

  // 3. Save the newly filtered array to localStorage
  saveToStorage();
}
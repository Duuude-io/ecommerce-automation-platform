const ADDRESS_KEY = "savedAddresses";

export function getPayments() {
  const payments = JSON.parse(
    localStorage.getItem("payments")
  ) || [];

  return payments
}

export function getDefaultPayment() {
  const payment = getPayments();
  return payment.find(
    payment => payment.isDefault
  );
}

export function savePayments(payments) {
  localStorage.setItem(
    "payments",
    JSON.stringify(payments)
  );
}

// Addresses container

export function getAddresses() {
  const addresses = JSON.parse(
    localStorage.getItem(ADDRESS_KEY)
  ) || [];

  return addresses
}

export function getDefaultAddress() {
  const address = getAddresses();

  return address.find(
    address => address.isDefault
  );
}

export function saveAddresses(addresses) {
  localStorage.setItem(
    ADDRESS_KEY,
    JSON.stringify(addresses)
  );
}
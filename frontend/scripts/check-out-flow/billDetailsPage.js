import { checkoutSession } from './checkoutSession.js';

console.log("Billing Details Page Loaded")

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {

  const page = document.querySelector('.bill-details-page');

  if (!page) return;

  const form = page.querySelector('.js-billdetails-form');

  if (!form) return;

  form.addEventListener('submit', handleSubmit);
}

function handleSubmit(event) {

  event.preventDefault();

  const page = document.querySelector('.bill-details-page');

  const billingDetails = {
    firstName: page.querySelector('.js-first-name').value,
    lastName: page.querySelector('.js-last-name').value,
    apartment: page.querySelector('.js-apartment').value,
    streetAddress: page.querySelector('.js-street-address').value,
    city: page.querySelector('.js-city').value,
    state: page.querySelector('.js-state').value,
    zipCode: page.querySelector('.js-zip').value,
    email: page.querySelector('.js-email').value,
    phone: page.querySelector('.js-phone').value
  };

  checkoutSession.save({
    billingDetails
  });

  window.location.href = 'paymethodpage.html';
}
import { checkoutSession } from './checkoutSession.js';
import { countries, states } from '../../data/state.js';
import { getAddresses } from "../paymentStore.js"

console.log("Billing Details Page Loaded")

document.addEventListener('DOMContentLoaded', initPage);

function initPage() {
  renderSavedAddresses();
  renderStateList();
  renderCountryList();

  const page = document.querySelector('.bill-details-page');
  if (!page) return;

  const form = page.querySelector('.js-billdetails-form');
  if (!form) return;

  form.addEventListener('submit', handleSubmit);

  document.querySelector(".js-saved-addresses")
    ?.addEventListener("change", handleSavedAddressSelect);
}

function handleSubmit(event) {

  event.preventDefault();

  const page = document.querySelector('.bill-details-page');

  const billingDetails = {
    fullName: page.querySelector('.js-full-name').value,
    apartment: page.querySelector('.js-apartment').value,
    streetAddress: page.querySelector('.js-street-address').value,
    city: page.querySelector('.js-city').value,
    state: page.querySelector('.js-state').value,
    country: page.querySelector('.js-country').value,
    zipCode: page.querySelector('.js-zip').value,
    email: page.querySelector('.js-email').value,
    phone: page.querySelector('.js-phone').value
  };

  if (
    !billingDetails.fullName ||
    !billingDetails.streetAddress ||
    !billingDetails.city ||
    !billingDetails.state ||
    !billingDetails.country ||
    !billingDetails.email ||
    !billingDetails.phone
  ) {
    alert("Please fill all required fields");
    return;
  }

  checkoutSession.save({
    billingDetails
  });

  window.location.href = 'paymethodpage.html';
}

function renderSavedAddresses() {
  const container =
    document.querySelector(".js-saved-addresses");
  if (!container) return;

  const addresses = getAddresses();
  if (addresses.length === 0) {
    container.innerHTML = `
      <p>No saved addresses</p>
    `;
    return;
  }

  container.innerHTML = addresses.map(address => `
    <label class="saved-address-option">
      <input
        type="radio"
        name="saved-address"
        value="${address.id}"
      >

      ${address.isDefault ? "(Default)" : ""}
      <strong>${address.fullName}</strong><br>
      ${address.streetAddress}<br>
      ${address.city}, ${address.state}
    </label>
  `).join("");
}

function handleSavedAddressSelect(event) {
  if (event.target.name !== "saved-address") {
    return;
  }

  const addressId = event.target.value;
  const addresses = getAddresses();

  const selectedAddress = addresses.find(
    address => address.id === addressId
  );

  if (!selectedAddress) return;

  fillBillingForm(selectedAddress);

  checkoutSession.save({
    billingDetails: {
      fullName: selectedAddress.fullName,
      apartment: selectedAddress.apartment || "",
      streetAddress: selectedAddress.streetAddress,
      city: selectedAddress.city,
      state: selectedAddress.state,
      country: selectedAddress.country,
      zipCode: selectedAddress.zipCode || "",
      email: selectedAddress.email || "",
      phone: selectedAddress.phone || ""
    }
  });

  console.log(
    "Saved address to session:",
    checkoutSession.get().billingDetails
  );
}

function fillBillingForm(address) {
  const page = document.querySelector(".bill-details-page");
  if (!page) return;

  page.querySelector(".js-full-name").value =
    address.fullName || "";

  page.querySelector(".js-phone").value =
    address.phone || "";

  page.querySelector(".js-street-address").value =
    address.streetAddress || "";

  page.querySelector(".js-city").value =
    address.city || "";

  page.querySelector(".js-state").value =
    address.state || "";

  page.querySelector(".js-country").value =
    address.country || "";

  page.querySelector(".js-zip").value =
    address.zipCode || "";
}

function renderStateList() {
  const stateSelect = document.querySelector('.js-state');
  if (!stateSelect) return;

  let statesHTML = `
    <option value="" selected hidden>
      Select State
    </option>
  `;

  states.forEach((state) => {
    statesHTML += `
      <option value="${state.abbrev}">
        ${state.name}
      </option>
    `;
  });

  stateSelect.innerHTML = statesHTML;
  console.log("Successfully injected states!");
}

function renderCountryList() {
  const countrySelect = document.querySelector(".js-country");
  if (!countrySelect) return;

  let countriesHTML = `
    <option value="" selected hidden>
      Select Country
    </option>
  `;

  countries.forEach((country) => {
    countriesHTML += `
      <option value="${country}">
        ${country}
      </option>
    `;
  });

  countrySelect.innerHTML = countriesHTML;
  console.log("Successfully injected countries!");
}
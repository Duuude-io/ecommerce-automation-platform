import { auth } from "../auth/authStore.js";
import { initAuthGuard } from "../auth/authGuard.js";
import { states, countries } from "../../data/state.js";

initAuthGuard("profile-page");

const ADDRESS_KEY = "savedAddresses";
const user = auth.getUser();

document.addEventListener("DOMContentLoaded", () => {
  renderStateList();
  renderCountryList();
  renderAddresses();

  document.querySelector(".js-add-address")
    ?.addEventListener("click", toggleAddressForm);

  document.querySelector(".js-save-address")
    ?.addEventListener("click", saveAddress);

  document.addEventListener("click", handleDeleteAddress);
});

document.querySelector(".js-profile-name").textContent =
  user?.name || "Not provided";

document.querySelector(".js-profile-email").textContent =
  user?.email || "Not provided";

document.querySelector(".js-profile-phone").textContent =
  user?.phone || "Not provided";

document.querySelector(".js-profile-status").textContent =
  user?.fullyVerified
    ? "Fully Verified"
    : "Partially Verified";

document.querySelector(".js-back-btn")
  ?.addEventListener("click", () => {
    window.location.href = "account.html";
  });


// Addresses container

function getAddresses() {
  return JSON.parse(
    localStorage.getItem(ADDRESS_KEY)
  ) || [];
}

function saveAddresses(addresses) {
  localStorage.setItem(
    ADDRESS_KEY,
    JSON.stringify(addresses)
  );
}

function saveAddress() {
  const address = {
    id: crypto.randomUUID(),

    fullName:
      document.querySelector(".js-full-name").value.trim(),
    phone:
      document.querySelector(".js-phone").value.trim(),
    streetAddress:
      document.querySelector(".js-address").value.trim(),

    city: document.querySelector(".js-city").value.trim(),
    state: document.querySelector(".js-state").value,
    country: document.querySelector(".js-country").value
  };

  if (
    !address.fullName ||
    !address.phone ||
    !address.streetAddress ||
    !address.city ||
    !address.state ||
    !address.country
  ) {
    alert("Please fill all fields");
    return;
  }

  const addresses = getAddresses();

  addresses.push(address);
  saveAddresses(addresses);

  resetAddressForm();
  renderAddresses();

  document.querySelector(".js-address-form")
    ?.classList.add("hidden");
}

function renderAddresses() {
  const container = document.querySelector(".js-address-list");
  if (!container) return;

  const addresses = getAddresses();
  if (!addresses.length) {
    container.innerHTML = `
      <p>No saved addresses yet.</p>
    `;
    return;
  }

  container.innerHTML = addresses.map(address => `
    <div class="saved-address">
      <h3>${address.fullName}</h3>
      <p>${address.phone}</p>
      <p>${address.streetAddress}</p>
      <p>
        ${address.city},
        ${address.state},
        ${address.country}
      </p>

      <button
        class="js-delete-address"
        data-id="${address.id}">
        Delete
      </button>

    </div>
  `).join("");
}

function renderStateList() {
  const stateSelect = document.querySelector(".js-state");
  if (!stateSelect) return;

  stateSelect.innerHTML = `
    <option value="" selected hidden>
      Select State
    </option>
  `;

  states.forEach(state => {
    stateSelect.innerHTML += `
      <option value="${state.abbrev}">
        ${state.name}
      </option>
    `;
  });
}

function renderCountryList() {
  const countrySelect = document.querySelector(".js-country");
  if (!countrySelect) return;

  countrySelect.innerHTML = `
    <option value="" selected hidden>
      Select Country
    </option>
  `;

  countries.forEach(country => {
    countrySelect.innerHTML += `
      <option value="${country}">
        ${country}
      </option>
    `;
  });
}

function resetAddressForm() {
  document.querySelector(".js-full-name").value = "";
  document.querySelector(".js-phone").value = "";

  document.querySelector(".js-address").value = "";
  document.querySelector(".js-city").value = "";

  document.querySelector(".js-state").selectedIndex = 0;
  document.querySelector(".js-country").selectedIndex = 0;
}

function toggleAddressForm() {
  document.querySelector(".js-address-form")
    ?.classList.toggle("hidden");
}

function handleDeleteAddress(event) {
  if (!event.target.classList.contains("js-delete-address")) {
    return;
  }

  const addressId = event.target.dataset.id;
  const addresses = getAddresses().filter(
    address => address.id !== addressId);

  saveAddresses(addresses);
  renderAddresses();
}
import { auth } from "../auth/authStore.js";
import { initAuthGuard } from "../auth/authGuard.js";
import { states, countries } from "../../data/state.js";
import { API_BASE_URL } from "../config.js";

console.log("profile page loaded");

let editingAddressId = null;

initAuthGuard("profile-page");

const user = auth.getUser();

document.addEventListener("DOMContentLoaded", () => {
  renderStateList();
  renderCountryList();
  renderAddresses();

  document.querySelector(".js-add-address")
    ?.addEventListener("click", toggleAddressForm);

  document.querySelector(".js-save-address")
    ?.addEventListener("click", saveAddress);

  document.addEventListener("click", handleAddressActions);
});

function toggleAddressForm() {
  const form = document.querySelector(".js-address-form");

  if (!form) {
    console.error("Address form not found");
    return;
  }

  editingAddressId = null;

  resetAddressForm();

  form.classList.toggle("hidden");
}

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

async function saveAddress() {
  try {
    const address = {
      fullName:
        document.querySelector(".js-full-name").value.trim(),
      phone:
        document.querySelector(".js-phone").value.trim(),
      streetAddress:
        document.querySelector(".js-address").value.trim(),

      city: document.querySelector(".js-city").value.trim(),
      state: document.querySelector(".js-state").value,
      country: document.querySelector(".js-country").value,
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

    if (editingAddressId) {
      const res = await fetch(
        `${API_BASE_URL}/profile/addresses/${editingAddressId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.getToken()}`
          },
          body: JSON.stringify(address)
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update address");
      }

      editingAddressId = null;

    } else {
      const res = await fetch(
        `${API_BASE_URL}/profile/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.getToken()}`
          },
          body: JSON.stringify(address)
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save address");
      }
    }

    resetAddressForm();
    await renderAddresses();

    document.querySelector(".js-address-form")
      ?.classList.add("hidden");

  } catch {
    console.error(error);
    alert("Address save failed")
  }
}

async function renderAddresses() {
  const container = document.querySelector(
    ".js-address-list");
  if (!container) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/profile/addresses`,
      {
        headers: {
          "Authorization": `Bearer ${auth.getToken()}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load addresses");
    }

    const addresses = await res.json();
    console.log(addresses);

    if (!addresses.length) {
      container.innerHTML = `
        <p>No saved addresses yet.</p>
      `;
      return;
    }

    container.innerHTML = addresses.map(address => `
      <div class="saved-address" data-id="${address.id}">
        ${address.isDefault ? `
          <p class="default-badge">
            Default Address
          </p>
        ` : ""}

        <h3>${address.fullName}</h3>
        <p>${address.phone}</p>
        <p>${address.streetAddress}</p>
        <p>
          ${address.city},
          ${address.state},
          ${address.country}
        </p>

        <button class="js-edit-address">Edit</button>

        ${!address.isDefault ? `
          <button class="js-set-default">
            Set as Default
          </button>
        ` : ""}

        <button
          class="js-delete-address">
          Delete
        </button>
      </div>

    `).join("");

  } catch (error) {
    console.error(error);
  }
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

async function handleAddressActions(event) {
  const card = event.target.closest(".saved-address");
  if (!card) return;

  const addressId = card.dataset.id;
  if (!addressId) {
    console.error("No address ID found");
    return;
  }

  // DELETE
  if (event.target.classList.contains("js-delete-address")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await renderAddresses();

    } catch (error) {
      console.error(error);
    }
    return;
  }

  // EDIT
  if (event.target.classList.contains("js-edit-address")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/addresses`,
        {
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch pays");
      }

      const addresses = await res.json();

      const address = addresses.find(
        address => address.id === addressId
      );

      if (!address) return;

      document.querySelector(".js-full-name").value =
        address.fullName;

      document.querySelector(".js-phone").value =
        address.phone;

      document.querySelector(".js-address").value =
        address.streetAddress;

      document.querySelector(".js-city").value =
        address.city;

      document.querySelector(".js-state").value =
        address.state;

      document.querySelector(".js-country").value =
        address.country;

      editingAddressId = address.id;

      document.querySelector(".js-address-form")
        ?.classList.remove("hidden");

    } catch (error) {
      console.error(error);
    }
    return;
  }

  // SET DEFAULT
  if (event.target.classList.contains("js-set-default")) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/profile/addresses/${addressId}/default`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${auth.getToken()}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Set default failed");
      }

      await renderAddresses();

    } catch (error) {
      console.error(error);
    }
  }
}
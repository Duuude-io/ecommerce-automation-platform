import { auth } from "../auth/authStore.js"
import { clearAuthState } from "../auth/authFlow.js"

export function renderAccountHeader() {

  const container = document.querySelector('.js-account-section');
  if (!container) return;

  /* NOT LOGGED IN */
  if (!auth.isLoggedIn()) {
    container.innerHTML = `
      <a href="login.html" class="header-link account-link">
        <span>Sign in</span>
        <span class="orders-text">Account</span>
      </a>
    `;
    return;
  }

  /* LOGGED IN */
  container.innerHTML = `
    <div class="account-menu">
      <span>Hello, User</span>
      <button class="js-signout-btn signout-btn">
        Sign Out
      </button>
    </div>
  `;

  container
    .querySelector('.js-signout-btn')
    .addEventListener('click', signOut);
}

/* CENTRALIZED LOGOUT */
function signOut() {

  auth.logout();        // removes token + userId
  clearAuthState();     // clears auth flow

  localStorage.removeItem("identifier");

  window.location.replace("login.html");
}
import { auth } from "../auth/authStore.js"
import { clearAuthState } from "../auth/authFlow.js"
import { authContext } from "../auth/authContext.js";

export function renderAccountHeader() {

  const container = document.querySelector('.js-account-section');
  if (!container) return;

  const user = auth.getUser();

  const firstName =
    user?.name ||
    user?.first_name ||
    user?.firstName ||
    "User";

  console.log(auth.getUser())

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
    <a href="profile/account.html" class="header-link">
      <span>Hello, ${firstName}</span>
      <span class="orders-text">My Account</span>
    </a>
  </div>
`;
}

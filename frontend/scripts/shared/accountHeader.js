export function renderAccountHeader() {
  const container = document.querySelector('.js-account-section');
  if (!container) return;

  const token = localStorage.getItem('token');

  if (!token) {
    container.innerHTML = `
      <a href="login.html" class="header-link account-link">
        <span>Sign in</span>
        <span class="orders-text">Account</span>
      </a>
    `;
    return;
  }

  container.innerHTML = `
    <div class="account-menu">
      <span>Hello, User</span>
      <button class="js-signout-btn signout-btn">
        Sign Out
      </button>
    </div>
  `;

  document
    .querySelector('.js-signout-btn')
    .addEventListener('click', signOut);
}

function signOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  window.location.href = 'login.html';
}
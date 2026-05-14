import { setAuthState, goToNextAuthStep, AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { initAuthGuard } from "./authGuard.js";

console.log("New user login loaded");

initAuthGuard("login-auth-page");

document.addEventListener("DOMContentLoaded", () => {

  function initNewUserLogin() {

    const page = document.querySelector(".login-auth-page");
    if (!page) return;

    const identifier = authContext.getIdentifier();
    if (!identifier) return;

    const userEl = page.querySelector(".js-user-identifier");
    if (userEl) userEl.textContent = identifier;

    const typeEl = page.querySelector(".js-identifier-type");

    if (typeEl) {
      typeEl.textContent =
        authContext.getAuthType() === "email"
          ? "email"
          : "mobile number";
    }

    page.querySelector(".primary-button")?.addEventListener("click", () => {
      setAuthState(AuthState.CREATE_ACCOUNT);
      goToNextAuthStep();
    });

    page.querySelectorAll(".js-change-user").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("identifier");
        window.location.href = "login.html";
      });
    });
  }

  initNewUserLogin();

});
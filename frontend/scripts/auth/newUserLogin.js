import { AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { initAuthRouter } from "./authRouter.js";
import { safeNavigate } from "./safeNavigate.js";

console.log("New user login loaded");

document.addEventListener("DOMContentLoaded", () => {

  if (window.__LOGIN_AUTH_INIT__) return;
  window.__LOGIN_AUTH_INIT__ = true;

  initAuthRouter("login-auth-page");

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
      safeNavigate(AuthState.CREATE_ACCOUNT);
    });

    page.querySelectorAll(".js-change-user").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();

        sessionStorage.removeItem("authSession")
        localStorage.removeItem("identifier");
        window.location.href = "login.html";
      });
    });
  }

  initNewUserLogin();

});
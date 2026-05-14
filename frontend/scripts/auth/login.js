import { setAuthState, goToNextAuthStep, AuthState, clearAuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { initAuthGuard } from "./authGuard.js";
import { resumeAuthFlow } from "./resumeAuth.js";

console.log("Login Page loaded");

resumeAuthFlow();

initAuthGuard("login-page");

document.addEventListener("DOMContentLoaded", () => {

  function initLogin() {

    const page = document.querySelector(".login-page");
    if (!page) return;

    const form = page.querySelector(".js-login-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const identifier = document
        .querySelector("#number-email")
        .value.trim()
        .toLowerCase();

      if (!identifier) return alert("Enter email or phone");

      const response = await fetch(
        "http://127.0.0.1:8000/check-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier })
        }
      );

      const data = await response.json();

      authContext.setIdentifier(identifier);

      if (data.userExists) {
        setAuthState(AuthState.USER_EXISTS);
      } else {
        setAuthState(AuthState.NEW_USER_AUTH);
      }

      goToNextAuthStep();
    });
  }

  initLogin();

});
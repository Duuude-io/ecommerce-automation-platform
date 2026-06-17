import { AuthState, getAuthRoutes } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { initAuthRouter } from "./authRouter.js";
import { safeNavigate } from "./safeNavigate.js";
import { API_BASE_URL } from "../config.js";

console.log("Login Page loaded");

initAuthRouter("login-page");

document.addEventListener("DOMContentLoaded", () => {

  if (window.__LOGIN_INIT__) return;
  window.__LOGIN_INIT__ = true;

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

      if (!identifier) {
        alert("Enter email or phone");
        return;
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/check-user`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier })
          }
        );

        const data = await response.json();
        const routes = getAuthRoutes();
        authContext.setIdentifier(identifier);

        if (data.userExists) {
          safeNavigate(AuthState.USER_EXISTS, {
            userId: data.userId
          });

        } else {
          safeNavigate(AuthState.NEW_USER_AUTH);
        }

      } catch (apiError) {
        console.error("Network communication error:", apiError);
        alert("Something went wrong connecting to the auth server.");
      }
    });
  }

  initLogin();

});
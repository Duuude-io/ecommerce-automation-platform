import { setAuthState, AuthState, getAuthRoutes } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { resumeAuthFlow } from "./resumeAuth.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("Login Page loaded");

resumeAuthFlow();

initAuthRouter("login-page");

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

      if (!identifier) {
        alert("Enter email or phone");
        return;
      }

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/check-user",
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
          setAuthState(AuthState.USER_EXISTS, {
            userId: data.userId
          });

        } else {
          setAuthState(AuthState.NEW_USER_AUTH);
        }
        navigateAuth();

      } catch (apiError) {
        console.error("Network communication error:", apiError);
        alert("Something went wrong connecting to the auth server.");
      }
    });
  }

  initLogin();

});
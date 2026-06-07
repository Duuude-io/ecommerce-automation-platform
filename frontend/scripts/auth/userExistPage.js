console.log("PAGE:", window.location.pathname);
console.log("SESSION:", getAuthState());

import { verifyOtp } from "./otpService.js";
import { setAuthState, AuthState, clearAuthState, getAuthState } from "./authFlow.js";
import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("User Exist Page loaded");

document.addEventListener("DOMContentLoaded", () => {

  initAuthRouter("user-exist-page");

  function initUserExistPage() {

    const page = document.querySelector(".user-exist-page");
    if (!page) return;

    const identifier = authContext.getIdentifier();

    if (!identifier) {
      window.location.replace("login.html");
      return;
    }

    // show identifier
    page.querySelector(".otp-number").innerHTML =
      `${identifier} <a href="#" class="js-change-login">Change</a>`;

    const changeLink = page.querySelector(".js-change-login");

    changeLink.addEventListener("click", (e) => {
      e.preventDefault();

      authContext.clear();
      setAuthState(AuthState.LOGIN);
      navigateAuth();
    });

    const form = page.querySelector(".create-form");
    const otpLoginLink = page.querySelector(".js-otp-login");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = page.querySelector("input[type='password']").value;

      if (!password) {
        alert("Enter password");
        return;
      }

      try {

        const res = await fetch(
          "http://127.0.0.1:8000/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier,
              password
            })
          }
        );

        const data = await res.json();

        console.log("LOGIN RESPONSE:", data);

        if (!data.success) {
          alert(data.message || "Login failed");
          return;
        }

        auth.login({
          token: data.token,
          userId: data.userId,
          userData: data.userData
        });

        console.log("SETTING AUTHENTICATED");

        setAuthState(AuthState.AUTHENTICATED, {
          userId: data.userId
        });
        navigateAuth();

        console.log("NEW SESSION:", localStorage.getItem("authSession"));

      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });


    otpLoginLink.addEventListener("click", async (e) => {
      e.preventDefault();

      const session = getAuthState();

      if (!session?.userId) {
        alert("Session expired. Please login again.");
        window.location.replace("login.html");
        return;
      }

      await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          identifier,
          purpose: "login"
        })
      });

      setAuthState(AuthState.OTP_LOGIN, {
        userId: session.userId
      });
      navigateAuth();

    });
  }

  initUserExistPage();

});
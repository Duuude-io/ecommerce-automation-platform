import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { setAuthState, AuthState, getAuthState } from "./authFlow.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("User Login Loaded");

document.addEventListener("DOMContentLoaded", () => {

  initAuthRouter("otp-user-login-page");

  function initOtpUserLogin() {

    const page = document.querySelector(".otp-user-login-page");
    if (!page) return;

    const form = page.querySelector(".create-form");
    const input = page.querySelector(".js-otp-user-input");
    const btn = form?.querySelector("button");

    const identifier = authContext.getIdentifier();

    const otpNumber = page.querySelector(".otp-number");
    if (otpNumber) {
      otpNumber.textContent = identifier;
    }

    let verifying = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (verifying) return;

      const otp = input.value.trim();

      if (!otp) {
        alert("Enter OTP");
        return;
      }

      verifying = true;
      if (btn) btn.disabled = true;

      try {

        const session = getAuthState();

        const res = await fetch("http://127.0.0.1:8000/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            otp,
            purpose: "login"
          })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          alert(data.error || "Failed to verify OTP");
          return;
        }

        auth.login({
          token: data.token,
          userId: data.userId
        });

        setAuthState(AuthState.AUTHENTICATED, {
          userId: data.userId
        });
        navigateAuth();

      } catch (err) {
        console.error(err);
        alert("Server error");

      } finally {
        verifying = false;
        if (btn) btn.disabled = false;
      }
    });
  }

  initOtpUserLogin();

});
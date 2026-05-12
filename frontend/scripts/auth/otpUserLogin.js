import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { setAuthState, goToNextAuthStep, AuthState } from "./authFlow.js";

console.log("User Login Loaded");

function initOtpUserLogin() {

  const page = document.querySelector(".otp-user-login-page");
  if (!page) return;

  const form = page.querySelector(".create-form");
  const input = page.querySelector(".js-otp-user-input");
  const btn = form?.querySelector("button");

  const identifier = authContext.getIdentifier();

  if (!identifier) {
    window.location.replace("login.html");
    return;
  }

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

      const res = await fetch("http://127.0.0.1:8000/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
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

      setAuthState(AuthState.AUTHENTICATED);
      goToNextAuthStep();

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
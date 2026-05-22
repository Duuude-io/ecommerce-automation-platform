import { setAuthState, AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { auth } from "./authStore.js";
import { initAuthRouter } from "./authRouter.js";
import { safeNavigate } from "./safeNavigate.js";

console.log("Add Email loaded");

document.addEventListener("DOMContentLoaded", () => {

  if (window.__ADD_EMAIL_INIT__) return;
  window.__ADD_EMAIL_INIT__ = true;

  initAuthRouter("add-email-page");

  function initAddEmail() {

    const page = document.querySelector(".add-email-page");
    if (!page) return;

    const form = page.querySelector(".js-email-form");
    const skipLink = page.querySelector(".js-skip-verification");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = page.querySelector(".js-email-input").value.trim();
      if (!email) return alert("Enter email");

      try {

        // 1. CHECK IF PHONE ALREADY EXISTS
        const checkRes = await fetch("http://127.0.0.1:8000/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email })
        });

        const checkData = await checkRes.json();

        if (checkData.userExists) {
          alert("This email is already linked to an account. Please login or use another.");

          return;
        }

        const token = auth.getToken();

        const addRes = await fetch("http://127.0.0.1:8000/add-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ email })
        });

        const addData = await addRes.json();
        if (!addRes.ok || addData.error) return alert(addData.error);

        const otpRes = await fetch("http://127.0.0.1:8000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: auth.getUserId(),
            identifier: email,
            purpose: "add_email"
          })
        });

        const otpData = await otpRes.json();
        if (!otpData.success) return alert("Failed OTP");

        authContext.setIdentifier(email);

        safeNavigate(AuthState.VERIFY_ADD_EMAIL, {
          userId: auth.getUserId()
        });

      } catch (err) {
        console.error(err);
      }
    });

    skipLink?.addEventListener("click", (e) => {
      e.preventDefault();

      safeNavigate(AuthState.AUTHENTICATED);
    });
  }

  initAddEmail();

});
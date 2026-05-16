import { auth } from "./authStore.js";
import { setAuthState, AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("Add Number loaded");

document.addEventListener("DOMContentLoaded", () => {

  initAuthRouter("add-number-page");

  function initAddNumber() {

    const page = document.querySelector(".add-number-page");
    if (!page) return;


    const form = page.querySelector(".js-mobile-form");
    const skipLink = document.querySelector(".js-skip-verification");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const country = page.querySelector(".js-country-code").value;
      const phone = page.querySelector(".js-phone-input").value.trim();

      if (!phone) {
        alert("Enter mobile number");
        return;
      }

      const countryCode = country.match(/\+\d+/)[0];
      const fullPhone = `${countryCode}${phone}`;

      try {

        // 1. CHECK IF PHONE ALREADY EXISTS
        const checkRes = await fetch("http://127.0.0.1:8000/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: fullPhone })
        });

        const checkData = await checkRes.json();

        if (checkData.userExists) {
          alert("This number is already linked to an account. Please login or use another.");

          return;
        }

        // 2. SAVE PHONE TO USER
        const token = auth.getToken();

        const addRes = await fetch("http://127.0.0.1:8000/add-phone", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            phone: fullPhone
          })
        });

        const addData = await addRes.json();

        if (!addRes.ok || addData.error) {
          alert(addData.error || "Failed to add phone");
          return;
        }

        // 3. SEND OTP
        const otpRes = await fetch("http://127.0.0.1:8000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: auth.getUserId(),
            identifier: fullPhone,
            purpose: "add_phone"
          })
        });

        const otpData = await otpRes.json();

        if (!otpRes.ok || !otpData.success) {
          alert("Failed to send OTP");
          return;
        }

        authContext.setIdentifier(fullPhone);

        setAuthState(AuthState.VERIFY_ADD_PHONE);
        navigateAuth();

      } catch (err) {
        console.error(err);
        alert("Server error");
      }

    });

    if (skipLink) {
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        setAuthState(AuthState.AUTHENTICATED);
        navigateAuth();
      });
    }
  }

  initAddNumber();

});

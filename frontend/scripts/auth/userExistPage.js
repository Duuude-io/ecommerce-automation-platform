import { verifyOtp } from "./otpService.js";
import { setAuthState, goToNextAuthStep, AuthState, clearAuthState } from "./authFlow.js";
import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { initAuthGuard } from "./authGuard.js";

console.log("User Exist Page loaded");

initAuthGuard("user-exist-page");

document.addEventListener("DOMContentLoaded", () => {

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
      window.location.replace("login.html");
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

        if (!data.success) {
          alert(data.message || "Login failed");
          return;
        }

        auth.login({
          token: data.token,
          userId: data.userId
        });

        console.log("SETTING AUTHENTICATED");

        setAuthState(AuthState.AUTHENTICATED);

        console.log("NEW SESSION:", localStorage.getItem("authSession"));
        goToNextAuthStep();
        console.log("AFTER NEXT STEP");

      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });


    otpLoginLink.addEventListener("click", async (e) => {
      e.preventDefault();

      await fetch(
        "http://127.0.0.1:8000/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            purpose: "login"
          })
        }
      );

      setAuthState(AuthState.OTP_LOGIN);
      goToNextAuthStep();
    });
  }

  initUserExistPage();

});
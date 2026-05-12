import { verifyOtp } from "./otpService.js";
import { setAuthState, goToNextAuthStep, AuthState } from "./authFlow.js";
import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";

console.log("User Exist Page loaded");

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
    `${identifier} <a href="login.html">Change</a>`;

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

      setAuthState(AuthState.AUTHENTICATED);
      goToNextAuthStep();

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

    setAuthState(AuthState.LOGIN_OTP);
    goToNextAuthStep();
  });
}

initUserExistPage();
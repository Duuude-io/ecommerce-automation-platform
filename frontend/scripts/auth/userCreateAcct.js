import { authContext } from "./authContext.js";
import { AuthState } from "./authFlow.js";
import { initAuthRouter } from "./authRouter.js";
import { auth } from "./authStore.js";
import { safeNavigate } from "./safeNavigate.js";

console.log("Create Account loaded");

const CURRENT_PAGE_ID = "create-account-page";

document.addEventListener("DOMContentLoaded", () => {

  if (window.__CREATE_ACCOUNT_INIT__) return;
  window.__CREATE_ACCOUNT_INIT__ = true;

  initAuthRouter(CURRENT_PAGE_ID);

  function initUserCreateAcct() {

    const page = document.querySelector(".create-account-page");
    if (!page) return;

    const input = page.querySelector(".js-email-phone");
    const form = page.querySelector(".create-form");

    const identifier =
      authContext.getIdentifier()
      || getAuthState()?.identifier
      || localStorage.getItem("identifier");

    console.log("IDENTIFIER:", identifier);

    if (!identifier) {
      console.error("Missing identifier");
      return;
    }

    input.value = identifier;
    input.readOnly = true;
    input.style.backgroundColor = "#f0f2f2";
    input.style.cursor = "not-allowed";

    const signinLink = page.querySelector(".js-signin-link");

    if (signinLink && !signinLink.dataset.bound) {
      signinLink.dataset.bound = "true";

      signinLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        sessionStorage.removeItem("authSession")
        localStorage.removeItem("identifier");
        localStorage.removeItem("userId");

        window.location.assign("login.html");
      });
    }

    let submitting = false;

    form.addEventListener("submit", async (e) => {

      e.preventDefault();

      if (submitting) return;
      submitting = true;
      console.log("SUBMIT FIRED");

      try {

        const name = page.querySelector(".js-name").value.trim();
        const password = page.querySelector(".js-password").value;
        const confirmPassword = page.querySelector(".js-confirm-password").value;

        if (!name || !password || !confirmPassword) {
          alert("Please fill all fields");
          submitting = false;
          return;
        }

        if (password.length < 6) {
          alert("Password must be at least 6 characters");
          submitting = false;
          return;
        }

        if (password !== confirmPassword) {
          alert("Passwords do not match");
          submitting = false;
          return;
        }

        const authType = authContext.getAuthType();

        const signupResponse = await fetch("http://127.0.0.1:8000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            name,
            password
          })
        });

        const signupData = await signupResponse.json();

        console.log("SIGNUP RESPONSE:", signupData);

        if (!signupData.success) {
          alert(signupData.message || "Signup failed");
          submitting = false;
          return;
        }

        if (signupData.resume) {
          safeNavigate(signupData.nextStep, {
            identifier,
            authType: signupData.authType,
            userId: signupData.userId
          });
          return;
        }

        const nextStep =
          signupData.nextStep ??
          (authType === "email"
            ? AuthState.VERIFY_SIGNUP_EMAIL
            : AuthState.VERIFY_SIGNUP_PHONE);

        console.log("NEXT STEP:", nextStep);

        safeNavigate(nextStep, {
          identifier,
          authType,
          userId: signupData.userId
        });
        return;

      } catch (error) {
        console.error(error);
        alert("Server error");
      } finally {
        submitting = false;
      }
    });
  }

  initUserCreateAcct();

});
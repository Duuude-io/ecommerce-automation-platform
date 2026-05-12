import { authContext } from "./authContext.js";
import { setAuthState, goToNextAuthStep, getAuthState, AuthState } from "./authFlow.js";
import { initAuthGuard } from "./authGuard.js";
import { auth } from "./authStore.js";
import { resumeAuthFlow } from "./resumeAuth.js";

const CURRENT_PAGE_ID = "create-account-page";

console.log("Create Account loaded");

const session = getAuthState();

console.log("Current Page ID:", CURRENT_PAGE_ID, "Stored Session Step:", session?.step);

initAuthGuard(CURRENT_PAGE_ID);

resumeAuthFlow();

function initUserCreateAcct() {

  const page = document.querySelector(".create-account-page");
  if (!page) return;

  const input = page.querySelector(".js-email-phone");
  const form = page.querySelector(".create-form");

  const identifier = authContext.getIdentifier();

  if (!identifier) {
    window.location.replace("login.html");
    return;
  }

  input.value = identifier;
  input.readOnly = true;
  input.style.backgroundColor = "#f0f2f2";
  input.style.cursor = "not-allowed";

  page.querySelector(".js-signin-link")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    });

  let submitting = false;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (submitting) return;
    submitting = true;

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

      if (!signupData.success) {
        alert(signupData.message || "Signup failed");
        submitting = false;
        return;
      }

      if (signupData.resume) {

        setAuthState(signupData.nextStep, {
          identifier,
          authType: signupData.authType,
          userId: signupData.userId
        });

        goToNextAuthStep();
        return;
      }

      const nextStep =
        signupData.nextStep ??
        (authType === "email"
          ? AuthState.VERIFY_SIGNUP_EMAIL
          : AuthState.VERIFY_SIGNUP_PHONE);

      setAuthState(nextStep, {
        identifier,
        authType,
        userId: signupData.userId
      });

      goToNextAuthStep();

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  });
}

initUserCreateAcct();
import { setAuthState, goToNextAuthStep, AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { auth } from "./authStore.js";
import { resumeAuthFlow } from "./resumeAuth.js";

console.log("Add Email loaded");

resumeAuthFlow();

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

      setAuthState(AuthState.VERIFY_ADD_EMAIL, {
        userId: auth.getUserId()
      });

      goToNextAuthStep();

    } catch (err) {
      console.error(err);
    }
  });

  skipLink?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "amazon.html";
  });
}

initAddEmail();
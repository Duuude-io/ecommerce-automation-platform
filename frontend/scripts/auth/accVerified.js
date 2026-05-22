import { auth } from "./authStore.js";
import { clearAuthState } from "./authFlow.js";
import { initAuthRouter } from "./authRouter.js";

console.log("Acc verified page loaded")

document.addEventListener("DOMContentLoaded", () => {

  if (window.__ACC_VERIFIED_INIT__) return;
  window.__ACC_VERIFIED_INIT__ = true;

  initAuthRouter("acc-verified-page");

  function initAccountVerified() {
    const page = document.querySelector(".acc-verified-page");
    if (!page) return;

    const user = auth.getUser();
    const emailDisplay = page.querySelector(".js-display-email");

    if (emailDisplay && user && user.email) {
      emailDisplay.textContent = user.email;
    } else if (emailDisplay && user && user.phone) {
      emailDisplay.textContent = user.phone;
    }

    const startBtn = page.querySelector(".js-start-shopping");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        clearAuthState();
        window.location.href = "amazon.html";
      });
    }
  }

  initAccountVerified();
});

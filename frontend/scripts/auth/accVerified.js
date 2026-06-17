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
    const phoneDisplay = page.querySelector(".js-display-phone");

    if (emailDisplay && user?.email) {
      emailDisplay.textContent = user.email;
    }

    if (phoneDisplay && user?.phone) {
      phoneDisplay.textContent = user.phone;
    }

    const startBtn = page.querySelector(".js-start-shopping");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        clearAuthState();
        window.location.href = "index.html";
      });
    }
  }

  initAccountVerified();
});

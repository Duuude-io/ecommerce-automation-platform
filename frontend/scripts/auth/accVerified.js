import { auth } from "./authStore.js";
import { clearAuthState } from "./authFlow.js";
import { initAuthGuard } from "./authGuard.js";

console.log("Acc verified page loaded")

initAuthGuard("acc-verified-page")

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

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initAccountVerified);
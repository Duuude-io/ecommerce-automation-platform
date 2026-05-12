import { auth } from "./authStore.js";
import { clearAuthState } from "./authFlow.js";
import { initAuthGuard } from "./authGuard.js";

console.log("Acc verified page loaded")

initAuthGuard("acc-verified-page")

function initAccountVerified() {
  // Select the main container
  const page = document.querySelector(".acc-verified-page");
  if (!page) return;

  // 1. Display User Info
  // We pull from authStore because the verify-otp step updated it
  const user = auth.getUser();
  const emailDisplay = page.querySelector(".js-display-email");

  if (emailDisplay && user && user.email) {
    emailDisplay.textContent = user.email;
  } else if (emailDisplay && user && user.phone) {
    // Fallback if they signed up with phone only
    emailDisplay.textContent = user.phone;
  }

  // 2. Handle the "Continue Shopping" Button
  const startBtn = page.querySelector(".js-start-shopping");
  if (startBtn) {
    startBtn.addEventListener("click", () => {

      clearAuthState();

      // Redirect to the homepage
      window.location.href = "amazon.html";
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initAccountVerified);
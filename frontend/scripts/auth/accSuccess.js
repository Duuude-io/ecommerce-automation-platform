import { initAuthGuard } from "./authGuard.js";
import { resumeAuthFlow } from "./resumeAuth.js";
import { setAuthState, AuthState, goToNextAuthStep } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { auth } from "./authStore.js";

initAuthGuard("acc-success-page");

console.log("Acc Success loaded");

document.addEventListener("DOMContentLoaded", () => {

  function initAccSuccess() {

    const page = document.querySelector(".acc-success-page");

    if (!page) {
      console.warn("Skipping page script");
      return;
    }

    const continueBtn = page.querySelector(".primary-button");

    if (!continueBtn) return;

    continueBtn.addEventListener("click", () => {

      const user = auth.getUser();
      console.log("Checking completion:", user);

      if (user && user.fullyVerified) {
        console.log("User is fully verified. Sending home.");
        setAuthState(AuthState.AUTHENTICATED);
        goToNextAuthStep();
        return;
      }

      console.log("Verification Status:", {
        email: user.email,
        phone: user.phone,
        isComplete: (!!user.email && !!user.phone)
      });

      const currentAuthType = authContext.getAuthType();

      if (currentAuthType === "email") {
        setAuthState(AuthState.ADD_PHONE);
      } else {
        setAuthState(AuthState.ADD_EMAIL);
      }
      goToNextAuthStep();
    });
  }

  initAccSuccess();

});
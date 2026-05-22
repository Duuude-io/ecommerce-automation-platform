console.log("ACC SUCCESS FILE EXECUTED");

import { AuthState } from "./authFlow.js";
import { authContext } from "./authContext.js";
import { auth } from "./authStore.js";
import { initAuthRouter } from "./authRouter.js";
import { safeNavigate } from "./safeNavigate.js";

console.log("Acc Success loaded");

document.addEventListener("DOMContentLoaded", () => {

  console.log("ACC SUCCESS DOM READY");

  if (window.__ACC_SUCCESS_INIT__) return;
  window.__ACC_SUCCESS_INIT__ = true;

  initAuthRouter("acc-success-page");

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
        safeNavigate(AuthState.AUTHENTICATED);
        return;
      }

      console.log("Verification Status:", {
        email: user.email,
        phone: user.phone,
        isComplete: (!!user.email && !!user.phone)
      });

      const currentAuthType = authContext.getAuthType();

      if (currentAuthType === "email") {
        safeNavigate(AuthState.ADD_PHONE);
      } else {
        safeNavigate(AuthState.ADD_EMAIL);
      }
    });
  }

  initAccSuccess();

});
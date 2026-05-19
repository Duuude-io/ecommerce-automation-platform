import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { setAuthState, AuthState, getAuthState } from "./authFlow.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("User Login Loaded");

document.addEventListener("DOMContentLoaded", () => {

  function initOtpUserLogin() {

    const page = document.querySelector(".otp-user-login-page");
    if (!page) return;

    const form = page.querySelector(".create-form");
    const input = page.querySelector(".js-otp-user-input");
    const btn = form?.querySelector("button");
    const resendBtn = page.querySelector(".js-resend-otp");

    const identifier = authContext.getIdentifier();
    if (!identifier) return;

    const userEl = page.querySelector(".js-user-identifier");
    if (userEl) userEl.textContent = identifier;

    const changeIdentifier = page.querySelector(".otp-number").innerHTML =
      `${identifier} <a href="#" class="js-change-login">Change</a>`;

    const changeLink = page.querySelector(".js-change-login");

    changeLink.addEventListener("click", (e) => {
      e.preventDefault();

      authContext.clear();
      setAuthState(AuthState.LOGIN);
      navigateAuth();
    });

    let verifying = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (verifying) return;

      const otp = input.value.trim();

      if (!otp) {
        alert("Enter OTP");
        return;
      }

      verifying = true;
      if (btn) btn.disabled = true;

      try {

        const session = getAuthState();

        const res = await fetch("http://127.0.0.1:8000/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            otp,
            purpose: "login"
          })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          alert(data.error || "Failed to verify OTP");
          return;
        }

        auth.login({
          token: data.token,
          userId: data.userId
        });

        setAuthState(AuthState.AUTHENTICATED, {
          userId: data.userId
        });
        navigateAuth();

      } catch (err) {
        console.error(err);
        alert("Server error");

      } finally {
        verifying = false;
        if (btn) btn.disabled = false;
      }
    });

    let cooldownActive = false;

    if (resendBtn) {
      resendBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (cooldownActive) return;

        const session = getAuthState();
        const currentId = identifier || authContext.getIdentifier();
        const targetUserId = session?.userId || auth.getUserId();

        if (!currentId || !targetUserId) {
          return alert("Session expired.");
        }

        if (cooldownActive) {
          console.log("Cooldown active");
          return;
        }

        cooldownActive = true;

        try {
          resendBtn.style.opacity = "0.5";
          resendBtn.style.pointerEvents = "none";

          const res = await fetch("http://127.0.0.1:8000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: targetUserId,
              identifier: currentId,
              purpose: "login"
            })
          });

          const data = await res.json();

          if (data.success) {
            alert("A new code has been sent!");
            startResendTimer(60);
          } else {
            resetResendBtn();
          }

        } catch (err) {
          console.error(err);
          resetResendBtn();
        }
      });
    }

    function startResendTimer(seconds) {
      let timeLeft = seconds;

      const interval = setInterval(() => {
        timeLeft--;
        resendBtn.textContent = `Resend in ${timeLeft}s`;

        if (timeLeft <= 0) {
          clearInterval(interval);
          resendBtn.textContent = "Resend code";
          resetResendBtn();
        }
      }, 1000);
    }

    function resetResendBtn() {
      cooldownActive = false;
      resendBtn.style.opacity = "1";
      resendBtn.style.pointerEvents = "auto";
    }
  }

  initOtpUserLogin();
});
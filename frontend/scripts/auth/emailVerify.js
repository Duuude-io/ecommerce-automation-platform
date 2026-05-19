import { verifyOtp } from "./otpService.js";
import { setAuthState, AuthState, getAuthState } from "./authFlow.js";
import { auth } from "./authStore.js";
import { authContext } from "./authContext.js";
import { initAuthRouter } from "./authRouter.js";
import { navigateAuth } from "./authNavigator.js";

console.log("Email verify loaded");

document.addEventListener("DOMContentLoaded", () => {

  initAuthRouter("email-verify-page");

  let cooldownActive = false;

  function initEmailVerify() {

    const page = document.querySelector(".email-verify-page");
    if (!page) return;

    const form = page.querySelector(".js-email-create-form");
    const input = page.querySelector(".js-otp-input");

    const identifier = authContext.getIdentifier() || getAuthState()?.identifier || "";
    const userEl = page.querySelector(".js-user-identifier");
    const changeLink = page.querySelector(".js-change-user");
    const resendBtn = page.querySelector(".js-resend-otp");

    if (userEl) userEl.textContent = identifier;

    if (changeLink) {
      changeLink.addEventListener("click", (e) => {
        e.preventDefault();

        console.log("Resetting session and returning to login...");

        // 1. Clear the temporary "in-progress" session data
        localStorage.removeItem("authSession");
        localStorage.removeItem("authContext_identifier");

        authContext.clear();
        setAuthState(AuthState.LOGIN);
        navigateAuth();
      });
    }

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

      try {
        const session = getAuthState();

        console.log("Current Session Object:", session);

        const userId = session.userId;

        let purpose = "signup";

        if (session.step === AuthState.VERIFY_ADD_EMAIL) {
          purpose = "add_email";
        } else if (session.step === AuthState.VERIFY_ADD_PHONE) {
          purpose = "add_phone";
        }

        const { data } = await verifyOtp({
          userId,
          otp,
          purpose
        });

        console.log("VERIFY DATA:", data)

        if (!data.success) {
          alert(data.message || "Invalid OTP");
          return;
        }

        console.log("OTP RESPONSE:", data);

        auth.login({
          token: data.token,
          userId: data.userId,
          userData: data.userData
        });

        if (data.fullyVerified) {
          setAuthState(AuthState.ACCOUNT_VERIFIED);
        } else {
          setAuthState(AuthState.ACCOUNT_SUCCESS);
        }
        navigateAuth();

      } catch (err) {
        console.error("Verification Error:", err);
        alert(err.message || "Server error");
      } finally {
        verifying = false;
      }
    });

    // --- Resend Logic ---

    if (resendBtn) {
      resendBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (cooldownActive) {
          console.log("Cooldown still active. Please wait.");
          return;
        }


        const session = getAuthState();
        const currentId = identifier || authContext.getIdentifier();
        const targetUserId = session?.userId || auth.getUserId();
        const originalText = resendBtn.textContent;

        console.log("Resend Check - ID:", currentId, "UID:", targetUserId);

        if (!currentId || !targetUserId) {
          return alert("Session data missing. Please try logging in again.");
        }

        try {
          // 1. Disable UI
          cooldownActive = true;
          resendBtn.style.opacity = "0.5";
          resendBtn.style.pointerEvents = "none";
          resendBtn.style.cursor = "not-allowed";

          let resendPurpose = "signup";

          if (session.step === AuthState.VERIFY_ADD_EMAIL) {
            resendPurpose = "add_email";
          } else if (session.step === AuthState.VERIFY_ADD_PHONE) {
            resendPurpose = "add_phone";
          }

          // 2. Call Backend
          const res = await fetch("http://127.0.0.1:8000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: targetUserId,
              identifier: currentId,
              purpose: resendPurpose
            })
          });

          const data = await res.json();

          if (data.success) {
            alert("A new code has been sent!");
            startResendTimer(60, resendBtn);
          } else {
            alert(data.message || "Failed to send code");
            resetResendBtn(resendBtn, originalText);
          }

        } catch (err) {
          console.error("Resend error:", err);
          resetResendBtn(resendBtn, originalText);
        }
      });
    }

    function startResendTimer(seconds, btn) {
      let timeLeft = seconds;
      const originalText = btn.textContent;

      const interval = setInterval(() => {
        timeLeft--;
        btn.textContent = `Resend code in ${timeLeft}s`;

        if (timeLeft <= 0) {
          clearInterval(interval);
          btn.textContent = originalText;
          resetResendBtn(btn);
        }
      }, 1000);
    }

    function resetResendBtn(btn) {
      cooldownActive = false;
      if (btn) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        btn.style.cursor = "pointer";
      }
    }
  }

  initEmailVerify();

});
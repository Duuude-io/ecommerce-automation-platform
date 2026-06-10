import { initAuthGuard } from "../auth/authGuard.js";
import { auth } from "../auth/authStore.js";
import { AuthState } from "../auth/authFlow.js";
import { safeNavigate } from "../auth/safeNavigate.js";
import { authContext } from "../auth/authContext.js";

initAuthGuard("account-page");

const user = auth.getUser();

document.addEventListener("DOMContentLoaded", () => {
  renderUserInfo();
  loadActiveSessions();

  document.querySelector(".js-update-password")
    ?.addEventListener("click", handlePasswordChange);
});

function renderUserInfo() {
  document.querySelector(".js-email").textContent =
    user?.email || "Not Added";

  document.querySelector(".js-phone").textContent =
    user?.phone || "Not Added";
}

async function handlePasswordChange() {
  const currentPassword = document.querySelector(".js-current-password").value.trim();

  const newPassword = document.querySelector(".js-new-password").value.trim();

  const confirmPassword = document.querySelector(".js-confirm-password").value.trim();

  const otpMethod = document.querySelector("input[name='otp-method']:checked").value;

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    alert("Please fill all fields");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {

    const token = auth.getToken();
    const user = auth.getUser();

    const response = await fetch(
      "http://127.0.0.1:8000/request-password-change",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          otpMethod
        })
      }
    );

    console.log("STATUS:", response.status);

    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);
    if (!data.success) {
      alert(data.message);
      return;
    }

    if (otpMethod === "email") {

      authContext.setIdentifier(user.email);

      safeNavigate(AuthState.PASSWORD_CHANGE_EMAIL, {
        userId: auth.getUserId()
      });
    } else {

      authContext.setIdentifier(user.phone);

      safeNavigate(AuthState.PASSWORD_CHANGE_PHONE, {
        userId: auth.getUserId()
      });
    }

  } catch (error) {
    console.error(error);
    alert("Unable to update password");
  }
}

async function loadActiveSessions() {

  try {

    const token = auth.getToken();

    console.log("TOKEN:", token);

    const res = await fetch(
      "http://127.0.0.1:8000/active-sessions",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log("SESSIONS:", data);

    const container =
      document.querySelector(".js-active-sessions");

    if (!data.success) {
      container.innerHTML = "<p>Unable to load sessions</p>";
      return;
    }

    container.innerHTML = data.sessions.map(session => {

      const isCurrent = session.id === data.current_session;
      return `
        <div class="session-card">

          <div>
            <strong>${session.device}</strong>
            ${isCurrent ? "<span>(Current)</span>" : ""}
          </div>

          <div>
            ${session.ip}
          </div>

          <div>
            ${new Date(session.created_at * 1000)
          .toLocaleString()}
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
  }
}

window.addEventListener("beforeunload", () => {
  console.log("LEAVING PAGE");
});
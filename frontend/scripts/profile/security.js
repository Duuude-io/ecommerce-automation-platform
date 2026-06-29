console.log("SECURITY PAGE LOADED");
console.trace("SECURITY PAGE ENTRY");

import { initAuthGuard } from "../auth/authGuard.js";
import { auth } from "../auth/authStore.js";
import { AuthState } from "../auth/authFlow.js";
import { safeNavigate } from "../auth/safeNavigate.js";
import { authContext } from "../auth/authContext.js";
import { API_BASE_URL } from "../config.js";
import { apiFetch } from "../apiClient.js";

//initAuthGuard("account-page");

const user = auth.getUser();

document.addEventListener("DOMContentLoaded", () => {
  renderUserInfo();
  loadActiveSessions();

  document.querySelector(".js-update-password")
    ?.addEventListener("click", handlePasswordChange);
});

document.querySelector(".js-signout-others")
  ?.addEventListener(
    "click",
    revokeOtherSessions
  );

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
      `${API_BASE_URL}/request-password-change`,
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

  console.trace("loadActiveSessions called");

  try {

    const token = auth.getToken();
    console.log("TOKEN:", token);

    const res = await apiFetch(
      `${API_BASE_URL}/active-sessions`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.status === 401) {
      auth.logout();
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    console.log("SESSIONS:", data);

    if (!data.success) {
      container.innerHTML = "<p>Unable to load sessions</p>";
      return;
    }

    const container =
      document.querySelector(".js-active-sessions");

    container.innerHTML = data.sessions.map(session => {
      const isCurrent = session.id === data.current_session;

      return `
        <div class="session-card">
          <div>
            <strong>
              ${session.device}
              ${session.id ===
          data.current_session ? "(Current)" : ""}
            </strong>
          </div>

          <div>
            ${session.ip}
          </div>
          <div>
            ${new Date(session.created_at * 1000)
          .toLocaleString()}
          </div>

          ${session.id !== data.current_session
          ? `
            <button
              class="js-revoke-session"
              data-session-id="${session.id}">
              Sign Out
            </button>
            `
          : ""
        }

        </div>
      `;
    }).join("");

    document.querySelectorAll(".js-revoke-session").forEach(button => {
      button.addEventListener("click", async () => {
        const sessionId = button.dataset.sessionId;
        await revokeSession(sessionId);
      });
    });

    console.log("loadActiveSessions finished");

  } catch (err) {
    console.error(err);
  }
}

async function revokeSession(sessionId) {
  const token = auth.getToken();
  const res = await fetch(
    `${API_BASE_URL}/active-sessions/${sessionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await res.json();
  if (!data.success) {
    alert(data.message);
    return;
  }

  loadActiveSessions();
}

async function revokeOtherSessions() {
  const confirmed = confirm("Sign out all other devices?");
  if (!confirmed) {
    return;
  }

  try {

    const token = auth.getToken();
    const res = await fetch(
      `${API_BASE_URL}/active-sessions`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    if (!data.success) {
      alert(data.message);
      return;
    }

    alert("Other devices signed out");
    loadActiveSessions();

  } catch (err) {
    console.error(err);
    alert("Unable to revoke sessions");
  }
}

window.addEventListener("beforeunload", () => {
  console.trace("LEAVING PAGE");
});
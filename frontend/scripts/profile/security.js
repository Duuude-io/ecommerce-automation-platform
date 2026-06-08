import { initAuthGuard } from "../auth/authGuard.js";
import { auth } from "../auth/authStore.js";

initAuthGuard("account-page");

const user = auth.getUser();

document.addEventListener("DOMContentLoaded", () => {
  renderUserInfo();

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

    const response = await fetch(
      "http://127.0.0.1:8000/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      }
    );

    const data = await response.json();
    if (!data.success) {
      alert(data.message);
      return;
    }

    alert("Password updated successfully");
    console.log({ currentPassword, newPassword });

  } catch (error) {
    console.error(error);
    alert("Unable to update password");
  }
}
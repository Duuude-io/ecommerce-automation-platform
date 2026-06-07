import { initAuthGuard } from "../auth/authGuard.js";
import { auth } from "../auth/authStore.js";
import { clearAuthState } from "../auth/authFlow.js";
import { authContext } from "../auth/authContext.js";

initAuthGuard("account-page");

document.querySelector(".js-orders-card")
  ?.addEventListener("click", () => {
    window.location.href = "../orders.html";
  });

document.querySelector(".js-addresses-card")
  ?.addEventListener("click", () => {
    window.location.href = "addresses.html";
  });

const greeting = document.querySelector(".js-account-greeting");

const user = auth.getUser();

console.log(auth.getUser());
console.log("USER DATA:", user);

if (greeting && user) {

  const firstName =
    user.first_name ||
    user.firstName ||
    user.name ||
    "User";

  greeting.textContent =
    `Welcome back, ${firstName}`;
}

const signOut = document.querySelector(".js-logout-card")
  ?.addEventListener("click", () => {

    auth.logout();        // removes token + userId
    clearAuthState();
    authContext.clear();

    localStorage.removeItem("identifier");
    window.location.replace("../login.html");
  });
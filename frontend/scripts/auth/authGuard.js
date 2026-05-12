import { auth } from "./authStore.js";
import { getAuthState, getAuthRoutes } from "./authFlow.js";

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  const session = getAuthState();
  const routes = getAuthRoutes();

  // allow auth flow pages
  const authPages = [
    "login-page",
    "create-account-page",
    "login-auth-page",
    "email-verify-page",
    "number-verify-page",
    "user-exist-page",
    "acc-success-page",
    "otp-user-login-page",
    "add-email-page",
    "add-number-page"
  ];

  if (authPages.includes(pageName)) return;

  // protect amazon homepage
  if (pageName === "amazon-page") {

    if (!auth.isLoggedIn()) {

      console.warn("Blocked by AuthGuard");

      if (session && session.step) {
        const targetFile = routes[session.step];
        const currentFile = window.location.pathname.split("/").pop() || "amazon.html";

        // FIX: Only redirect if we aren't already there!
        if (targetFile && currentFile !== targetFile) {
          location.replace(targetFile);
        } else if (!targetFile) {
          location.replace("login.html");
        }
      } else {
        location.replace("login.html");
      }
    }
  }
}
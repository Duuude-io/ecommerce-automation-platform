import { auth } from "./authStore.js";
import { getAuthState, getAuthRoutes } from "./authFlow.js";

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  const session = getAuthState();
  const routes = getAuthRoutes();

  // allow auth flow pages
  const currentFile = window.location.pathname.split("/").pop() || "amazon.html";

  if (session && session.step) {

    const expectedFile = routes[session.step];

    if (expectedFile && expectedFile !== currentFile) {

      console.warn(
        "Wrong page for auth state → redirecting"
      );

      location.replace(expectedFile);
      return;
    }
  }

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
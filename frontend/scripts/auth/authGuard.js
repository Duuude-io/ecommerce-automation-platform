import { auth } from "./authStore.js";
import { getAuthState, getAuthRoutes } from "./authFlow.js";

console.trace("AuthGuard triggered");

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  const session = getAuthState();
  const routes = getAuthRoutes();

  const currentFile =
    window.location.pathname.split("/").pop() || "amazon.html";

  if (pageName === "amazon-page") {

    if (!auth.isLoggedIn()) {
      console.log("Not logged in → redirect login");
      window.location.replace("login.html");
      return;
    }

    document.body.classList.add("auth-ready");
    console.log("Amazon access granted");
    return;
  }

  if (
    session &&
    session.step &&
    session.step !== "authenticated"
  ) {
    const expectedFile = routes[session.step];

    if (expectedFile && currentFile !== expectedFile) {
      console.log(
        `AuthGuard redirecting: ${currentFile} → ${expectedFile}`
      );
      window.location.replace(expectedFile);
      return;
    }
  }

  document.body.classList.add('auth-ready');
  console.log("AuthGuard OK - Page Revealed");
}
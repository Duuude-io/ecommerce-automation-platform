import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navigateAuth } from "./authNavigator.js";

export function initAuthRouter(pageName) {

  const session = getAuthState();
  const routes = getAuthRoutes();

  const currentFile = window.location.pathname.split("/").pop();

  // If no session → allow only login page
  if (!session?.step && currentFile !== routes.login) {
    console.log("No session — waiting for navigator");
  }

  document.body.classList.add("auth-ready");
  return;
}

import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navigateAuth } from "./authNavigator.js";

export function initAuthRouter(pageName) {

  const session = getAuthState();
  const routes = getAuthRoutes();

  const currentFile = window.location.pathname.split("/").pop();

  // No session → only allow login page
  if (!session?.step) {
    const authPages = Object.values(routes);

    if (authPages.includes(currentFile) && currentFile !== routes.login) {
      window.location.replace(routes.login);
      return;
    }

    document.body.classList.add("auth-ready");
    return;
  }

  document.body.classList.add("auth-ready");
  return;
}
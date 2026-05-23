import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navigateAuth } from "./authNavigator.js";

export function initAuthRouter(pageName) {

  const session = getAuthState();
  const routes = getAuthRoutes();

  const currentFile =
    window.location.pathname.split("/").pop();

  console.log("ROUTER ACTIVE:", {
    pageName,
    currentFile,
    step: session?.step
  });

  if (!session?.step) {
    return;
  }

  const expectedRoute =
    routes[session.step];

  if (!expectedRoute) {
    return;
  }

  if (currentFile !== expectedRoute) {

    console.log(
      `Router correcting route: ${currentFile} → ${expectedRoute}`
    );

    navigateAuth("authRouter");
  }
}
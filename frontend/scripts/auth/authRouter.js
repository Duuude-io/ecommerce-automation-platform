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

  const expectedRoute = routes[session.step];
  if (!expectedRoute) {
    return;
  }

  console.log("EXPECTED ROUTE:", expectedRoute);
  console.log("CURRENT FILE:", currentFile);
  console.log("SESSION:", session);

  const expectedFile = expectedRoute.split("/").pop();
  if (currentFile !== expectedFile) {

    console.log(
      `Router correcting route: ${currentFile} → ${expectedFile}`
    );

    navigateAuth("authRouter");
  }
}
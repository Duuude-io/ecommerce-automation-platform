import { getAuthState, getAuthRoutes } from "./authFlow.js";

export function resumeAuthFlow() {

  const session = getAuthState();

  if (!session || !session.step) return;

  const routes = getAuthRoutes();
  const targetFile = routes[session.step];

  const currentFile = window.location.pathname.split("/").pop();

  if (currentFile === "login.html") return;

  if (currentFile !== targetFile) {
    window.location.replace(targetFile);
  }
}
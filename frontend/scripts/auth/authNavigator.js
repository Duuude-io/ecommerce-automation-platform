import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navDebug } from "./navDebug.js";

console.log("NAVIGATOR ACTIVE");

const NAV_KEY = "authNavigating";

export function navigateAuth(source = "unknown") {

  console.trace(`navigateAuth called from: ${source}`);

  if (sessionStorage.getItem(NAV_KEY) === "true") {
    console.log("Navigation blocked");
    return;
  }

  const session = getAuthState();

  if (!session?.step) {
    console.log("No auth session step");
    return;
  }

  const routes = getAuthRoutes();
  const target = routes[session.step];

  const current =
    window.location.pathname.split("/").pop();

  navDebug("STEP", session.step);
  navDebug("TARGET", target);
  navDebug("CURRENT", current);

  if (!target) {
    console.warn("No target route");
    return;
  }

  const lastTarget =
    sessionStorage.getItem("lastAuthTarget");

  if (current === target && lastTarget === target) {
    console.log("Already on target page");
    return;
  }

  sessionStorage.setItem(NAV_KEY, "true");
  sessionStorage.setItem("lastAuthTarget", target);

  console.log(`[NAVIGATE] ${current} → ${target}`);

  window.location.href = target;
}

window.addEventListener("pageshow", () => {
  sessionStorage.removeItem(NAV_KEY);
});
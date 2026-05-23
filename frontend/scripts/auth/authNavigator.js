import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navDebug } from "./navDebug.js";

console.log("NAVIGATOR ACTIVE");

const NAV_KEY = "authNavigating";
const LAST_TARGET_KEY = "lastAuthTarget";

export function navigateAuth(source = "unknown") {

  console.trace(`navigateAuth called from: ${source}`);

  const session = getAuthState();
  if (!session?.step) {
    console.log("No auth session step");
    return;
  }

  const routes = getAuthRoutes();
  const target = routes[session.step];

  if (!target) {
    console.warn("No target route");
    return;
  }

  const current = window.location.pathname.split("/").pop();

  navDebug("STEP", session.step);
  navDebug("TARGET", target);
  navDebug("CURRENT", current);

  const lastTarget = sessionStorage.getItem(LAST_TARGET_KEY);

  if (current === target && lastTarget === target) {
    console.log("Already on target page");
    return;
  }

  if (sessionStorage.getItem(NAV_KEY) === "true") {
    console.log("Navigation blocked");
    return;
  }

  sessionStorage.setItem(NAV_KEY, "true");
  sessionStorage.setItem(LAST_TARGET_KEY, target);

  console.log(`[NAVIGATE] ${current} → ${target}`);

  window.location.href = target;
}

window.addEventListener("pageshow", () => {
  sessionStorage.removeItem(NAV_KEY);
});

window.addEventListener("load", () => {
  sessionStorage.removeItem(NAV_KEY);
});
import { getAuthState, getAuthRoutes } from "./authFlow.js";
import { navDebug } from "./navDebug.js";

console.log("NAVIGATOR ACTIVE");

const LAST_TARGET_KEY = "lastAuthTarget";

let navigating = false;

export function navigateAuth(source = "unknown") {

  console.trace(`navigateAuth called from: ${source}`);

  const session = getAuthState();
  if (!session?.step) {
    console.log("No auth session step");
    navigating = false;
    return;
  }

  const routes = getAuthRoutes();
  const target = routes[session.step];

  if (!target) {
    console.warn("No target route");
    navigating = false;
    return;
  }

  console.log("navigating =", navigating);

  if (navigating) {
    console.log("Navigation blocked");
    navigating = false;
    return;
  }

  navigating = true;

  const current = window.location.pathname.split("/").pop();

  navDebug("STEP", session.step);
  navDebug("TARGET", target);
  navDebug("CURRENT", current);

  const lastTarget = sessionStorage.getItem(LAST_TARGET_KEY);

  if (current === target && lastTarget === target) {
    console.log("Already on target page");
    navigating = false;
    return;
  }

  sessionStorage.setItem(LAST_TARGET_KEY, target);

  console.log(`[NAVIGATE] ${current} → ${target}`);
  console.trace("NAVIGATION TARGET:", target);
  console.trace("navigateAuth called");

  window.location.href = target;
}
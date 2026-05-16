import { getAuthState, getAuthRoutes } from "./authFlow.js";

let navigating = false;

export function navigateAuth() {
  if (navigating) return;

  const session = getAuthState();
  if (!session?.step) return;

  const routes = getAuthRoutes();
  const target = routes[session.step];

  const current = window.location.pathname.split("/").pop();

  console.log("STEP:", session.step);
  console.log("TARGET:", target);
  console.log("CURRENT:", current);

  if (!target || current === target) return;

  navigating = true;

  console.log("NAVIGATOR →", current, "→", target);

  window.location.replace(target);
}

window.addEventListener("beforeunload", () => {
  navigating = false;
});
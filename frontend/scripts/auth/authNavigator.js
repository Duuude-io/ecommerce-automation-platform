import { getAuthState, getAuthRoutes } from "./authFlow.js";

const NAV_KEY = "authNavigating";

export function navigateAuth() {

  if (sessionStorage.getItem(NAV_KEY)) return;

  const session = getAuthState();
  if (!session?.step) return;

  const routes = getAuthRoutes();
  const target = routes[session.step];

  const current =
    window.location.pathname.split("/").pop();

  console.log("STEP:", session.step);
  console.log("TARGET:", target);
  console.log("CURRENT:", current);

  if (!target || current === target) return;

  sessionStorage.setItem(NAV_KEY, "true");

  console.log("NAVIGATOR:", current, "→", target);

  window.location.replace(target);
}

window.addEventListener("pageshow", () => {
  sessionStorage.removeItem(NAV_KEY);
});
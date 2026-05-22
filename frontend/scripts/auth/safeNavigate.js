import { setAuthState } from "./authFlow.js";
import { navigateAuth } from "./authNavigator.js";

export function safeNavigate(step, context) {

  console.log("SAFE NAVIGATE:", { step, context });

  setAuthState(step, context);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      navigateAuth("safeNavigate");
    });
  });
}
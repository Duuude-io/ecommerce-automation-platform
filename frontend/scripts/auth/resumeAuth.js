import { getAuthState, getAuthRoutes } from "./authFlow.js";

export function resumeAuthFlow() {
  const session = getAuthState();

  if (!session || session.step === "LOGIN") {
    console.log("No active flow");
    return;
  }

  const routes = getAuthRoutes();
  const targetFile = routes[session.step];

  if (!targetFile) return;

  const currentFile = window.location.pathname.split("/").pop();

  if (currentFile !== targetFile) {
    console.log(`Mismatch found: ${currentFile} vs ${targetFile}. Redirecting...`);
    window.location.replace(targetFile);
  } else {
    console.log("Path matches state. No redirect needed.");
  }
}
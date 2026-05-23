import { auth } from "./authStore.js";

console.trace("AuthGuard triggered");

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  const protectedPages = ["app-page"];

  if (!protectedPages.includes(pageName)) {
    return;
  }

  const loggedIn = auth.isLoggedIn();

  if (!loggedIn) {
    return;
  }

  console.log("AuthGuard OK - Page Revealed");
}
import { auth } from "./authStore.js";

console.trace("AuthGuard triggered");

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  const protectedPages = ["app-page"];

  if (!protectedPages.includes(pageName)) {
    document.body.classList.add("auth-ready");
    return;
  }

  document.body.classList.remove("auth-ready");

  const loggedIn = auth.isLoggedIn();

  if (!loggedIn) {
    document.body.classList.add("auth-ready");
    return;
  }

  document.body.classList.add("auth-ready");

  console.log("AuthGuard OK - Page Revealed");
}
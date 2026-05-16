import { auth } from "./authStore.js";

console.trace("AuthGuard triggered");

export function initAuthGuard(pageName) {

  console.log("AuthGuard:", pageName);

  // Hide page immediately
  document.body.classList.remove("auth-ready");

  const loggedIn = auth.isLoggedIn();

  const protectedPages = [
    "app-page"
  ];

  if (protectedPages.includes(pageName) && !loggedIn) {
    console.log("Blocked — not logged in");
    document.body.classList.add("auth-ready");
    return;
  }

  console.log("AuthGuard OK - Page Revealed");
}
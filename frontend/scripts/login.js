import { routeUser } from './authRouter.js';

console.log("Login JS loaded");

document.querySelector(".js-login-form")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const identifier = document.querySelector("#number-email")
      .value.trim().toLowerCase();

    if (!identifier) return alert("Enter email or phone");

    const response = await fetch("http://127.0.0.1:8000/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier })
    });

    const data = await response.json();

    localStorage.setItem("identifier", identifier);

    if (!data.userExists) {
      window.location.href = "loginauth.html";
      return;
    }

    // existing user → go to login OTP flow
    window.location.href = "userexistpage.html";
  });
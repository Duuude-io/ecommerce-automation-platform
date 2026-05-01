console.log("New user page loaded");

document.addEventListener("DOMContentLoaded", init);

function init() {

  const identifier = localStorage.getItem("identifier");

  // show identifier
  const userEl = document.querySelector(".js-user-identifier");
  if (userEl && identifier) {
    userEl.textContent = identifier;
  }

  // create account button
  const btn = document.querySelector(".primary-button");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.replace("createaccount.html");
    });
  }

  // identifier type
  const typeEl = document.querySelector(".js-identifier-type");
  if (identifier && typeEl) {
    const isEmail = identifier.includes("@");
    typeEl.textContent = isEmail ? "your email" : "your number";
  }

  // change user
  document.querySelectorAll(".js-change-user").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      window.location.replace("login.html");
    });
  });

}
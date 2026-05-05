console.log("New user login page loaded");

const identifier = localStorage.getItem("identifier");

if (!identifier) {
  window.location.href = "login.html";
}

// display identifier
document.querySelector(".js-user-identifier").textContent = identifier;

// detect type (optional UI helper)
const typeEl = document.querySelector(".js-identifier-type");

if (typeEl) {
  if (identifier.includes("@")) {
    typeEl.textContent = "email";
  } else {
    typeEl.textContent = "mobile number";
  }
}

// continue button
document.querySelector(".primary-button")
  .addEventListener("click", () => {
    window.location.href = "createaccount.html";
  });

// change user
document.querySelectorAll(".js-change-user")
  .forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      window.location.href = "login.html";
    });
  });
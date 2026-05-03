document.addEventListener("DOMContentLoaded", () => {

  const continueBtn = document.querySelector(".primary-button");

  const authType = localStorage.getItem("authType");
  const identifier = localStorage.getItem("identifier");

  // safety guard
  if (!authType || !identifier) {
    window.location.replace("login.html");
    return;
  }

  continueBtn.addEventListener("click", () => {

    // USER VERIFIED WITH EMAIL FIRST
    if (authType === "email") {
      window.location.href = "addnumber.html";
      return;
    }

    // USER VERIFIED WITH PHONE FIRST
    if (authType === "phone") {
      window.location.href = "addemail.html";
      return;
    }

  });

});
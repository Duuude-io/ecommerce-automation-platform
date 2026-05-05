document.addEventListener("DOMContentLoaded", () => {

  const continueBtn = document.querySelector(".primary-button");
  const nextStep = localStorage.getItem("nextStep");

  console.log("NEXT STEP:", nextStep);

  if (!continueBtn || !nextStep) {
    console.error("Button not found");
    return;
  }

  continueBtn.addEventListener("click", () => {

    if (nextStep === "add_email") {
      window.location.href = "addemail.html";
    }

    else if (nextStep === "add_phone") {
      window.location.href = "addnumber.html";
    }

    else {
      window.location.href = "amazon.html";
    }

  });

});
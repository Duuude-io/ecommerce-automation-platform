console.log("Email verify page loaded");

document.addEventListener("DOMContentLoaded", () => {

  const identifier = localStorage.getItem("identifier");

  const label = document.querySelector(".js-user-identifier");
  const form = document.querySelector(".create-form");
  const button = document.querySelector(".primary-button");
  const resendLink = document.querySelector(".js-resend-otp");


  if (!identifier) {
    window.location.replace("login.html");
    return;
  }

  if (label) {
    label.textContent = identifier;
  }


  async function verifyOTP() {

    const otp =
      document.querySelector(".js-otp-input").value.trim();

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            otp
          })
        }
      );

      const data = await res.json();
      console.log("verify response:", data);

      if (!data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      localStorage.setItem("verificationStatus", "half");

      window.location.replace("accsuccess.html");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  button.addEventListener("click", (e) => {
    e.preventDefault();
    verifyOTP();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    verifyOTP();
  });


  resendLink?.addEventListener("click", async (e) => {

    e.preventDefault();

    resendLink.textContent = "Sending...";
    resendLink.style.pointerEvents = "none";

    await fetch(
      "http://127.0.0.1:8000/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      }
    );

    resendLink.textContent = "Code sent ✔";

    setTimeout(() => {
      resendLink.textContent = "Resend code";
      resendLink.style.pointerEvents = "auto";
    }, 5000);

  });

});
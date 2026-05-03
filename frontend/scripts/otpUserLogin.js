document.addEventListener("DOMContentLoaded", () => {

  const identifier = localStorage.getItem("identifier");

  if (!identifier) {
    window.location.replace("login.html");
    return;
  }

  document.querySelector(".otp-number").innerHTML =
    `${identifier} <a href="login.html">Change</a>`;

  const form = document.querySelector(".create-form");

  async function verifyOTP() {

    const otp = document.querySelector('.js-otp-user-input').value.trim();

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          otp,
          purpose: "login"
        })
      }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Failed");
        return;
      }

      localStorage.setItem("token", data.token);

      window.location.replace("amazon.html");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    verifyOTP();
  });

});
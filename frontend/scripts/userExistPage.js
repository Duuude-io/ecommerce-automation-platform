document.addEventListener("DOMContentLoaded", () => {

  const identifier = localStorage.getItem("identifier");

  if (!identifier) {
    window.location.replace("login.html");
    return;
  }

  // show identifier
  document.querySelector(".otp-number").innerHTML =
    `${identifier} <a href="login.html">Change</a>`;

  const form = document.querySelector(".create-form");
  const otpLoginLink = document.querySelector(".js-otp-login");

  /* =====================
     PASSWORD LOGIN
  ====================== */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password =
      document.querySelector("input[type='password']").value;

    if (!password) {
      alert("Enter password");
      return;
    }

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            password
          })
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      window.location.replace("index.html");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });

  /* =====================
       OTP LOGIN
  ====================== */

  otpLoginLink.addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch(
      "http://127.0.0.1:8000/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          purpose: "login"
        })
      }
    );

    window.location.href = "otpuserlogin.html";
  });

});
console.log("Create account page loaded");

document.addEventListener("DOMContentLoaded", () => {

  const input = document.querySelector(".js-email-phone");
  const form = document.querySelector(".create-form");
  const identifier = localStorage.getItem("identifier");


  if (!identifier) {
    window.location.replace("login.html");
    return;
  }


  input.value = identifier;
  input.readOnly = true;
  input.style.backgroundColor = "#f0f2f2";
  input.style.cursor = "not-allowed";


  const signInLink = document.querySelector(".js-signin-link");

  if (signInLink) {
    signInLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      localStorage.removeItem("authType");
      window.location.href = "login.html";
    });
  }


  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name =
      document.querySelector(".js-name").value.trim();

    const password =
      document.querySelector(".js-password").value;

    const confirmPassword =
      document.querySelector(".js-confirm-password").value;

    // -------- VALIDATION --------

    if (!name || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // detect type
    const isEmail = identifier.includes("@");
    const authType = isEmail ? "email" : "phone";

    localStorage.setItem("authType", authType);

    try {

      console.log({
        identifier,
        name,
        password
      });


      const signupResponse = await fetch(
        "http://127.0.0.1:8000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            name,
            password
          })
        }
      );

      const signupData = await signupResponse.json();

      if (!signupResponse.ok || !signupData.success) {
        alert(signupData.message || "Signup failed");
        return;
      }


      const otpResponse = await fetch(
        "http://127.0.0.1:8000/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            purpose: "signup"
          })
        }
      );

      const otpData = await otpResponse.json();

      if (!otpData.success) {
        alert("Failed to send OTP");
        return;
      }


      window.location.href =
        authType === "email"
          ? "emailverify.html"
          : "numberverify.html";

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  });

});
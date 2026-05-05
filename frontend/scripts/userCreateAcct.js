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

  document.querySelector(".js-signin-link")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    });

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.querySelector(".js-name").value.trim();
    const password = document.querySelector(".js-password").value;
    const confirmPassword = document.querySelector(".js-confirm-password").value;

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

    const isEmail = identifier.includes("@");
    const authType = isEmail ? "email" : "phone";

    try {

      const signupResponse = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          name,
          password
        })
      });

      const signupData = await signupResponse.json();

      if (!signupData.success) {
        alert(signupData.message || "Signup failed");
        return;
      }

      localStorage.setItem("userId", signupData.userId);
      localStorage.setItem("identifier", identifier);

      const otpResponse = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: signupData.userId,
          identifier,
          purpose: "signup"
        })
      });

      const otpData = await otpResponse.json();

      if (!otpData.success) {
        alert("Failed to send OTP");
        return;
      }

      window.location.href = isEmail
        ? "emailverify.html"
        : "numberverify.html";

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  });

});
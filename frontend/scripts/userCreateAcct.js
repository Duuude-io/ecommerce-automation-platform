console.log("Create account page loaded");

document.addEventListener("DOMContentLoaded", () => {

  const input = document.querySelector(".js-email-phone");
  const identifier = localStorage.getItem("identifier");

  if (input && identifier) {
    input.value = identifier;
  }

  // Sign in link
  const signInLink = document.querySelector(".js-signin-link");

  if (signInLink) {
    signInLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("identifier");
      window.location.href = "login.html";
    });
  }

});

document.querySelector(".create-form")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const identifier = document.querySelector(".js-email-phone").value.trim();
    const name = document.querySelector(".js-name").value.trim();
    const password = document.querySelector(".js-password").value;
    const confirmPassword = document.querySelector(".js-confirm-password").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const authType = isEmail ? "email" : "phone";

    localStorage.setItem("identifier", identifier);
    localStorage.setItem("authType", authType);

    try {

      const signupResponse = await fetch(
        "http://127.0.0.1:8000/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier,
            password,
            name
          })
        }
      );

      const signupData = await signupResponse.json();

      if (!signupData.success) {
        alert(signupData.message || "Signup failed");
        return;
      }

      await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });

      window.location.href =
        authType === "email"
          ? "emailverify.html"
          : "numberverify.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
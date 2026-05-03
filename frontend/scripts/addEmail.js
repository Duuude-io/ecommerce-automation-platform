document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector(".js-email-form");
  const emailInput = document.querySelector(".js-email-input").value.trim();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = localStorage.getItem("identifier");

    if (!email) {
      alert("Enter email");
      return;
    }

    try {

      await fetch("http://127.0.0.1:8000/add-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          email
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Failed");
        return;
      }

      await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          purpose: "add_email"
        })
      });

      localStorage.setItem("identifier", email);
      localStorage.setItem("authType", "email");

      window.location.href = "emailverify.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

  });

});

const skipLink = document.querySelector(".js-skip-verification");

skipLink?.addEventListener("click", (e) => {
  e.preventDefault();

  // user stays HALF VERIFIED
  window.location.href = "amazon.html";
});
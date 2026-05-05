document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector(".js-email-form");
  const skipLink = document.querySelector(".js-skip-verification");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector(".js-email-input").value.trim();

    const identifier = localStorage.getItem("identifier");

    if (!email) {
      alert("Enter email");
      return;
    }

    try {

      const addRes = await fetch("http://127.0.0.1:8000/add-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email
        })
      });

      const addData = await addRes.json();

      if (!addRes.ok || addData.error) {
        alert(addData.error || "Failed to add email");
        return;
      }

      const otpRes = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          purpose: "add_email"
        })
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        alert("Failed to send OTP");
        return;
      }

      localStorage.setItem("identifier", email);
      localStorage.setItem("authType", "email");

      window.location.href = "emailverify.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });


  skipLink?.addEventListener("click", (e) => {
    e.preventDefault();

    // user stays HALF VERIFIED
    window.location.href = "amazon.html";
  });
});
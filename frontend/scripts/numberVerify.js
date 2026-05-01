document.addEventListener("DOMContentLoaded", () => {

  const identifier = localStorage.getItem("identifier");

  document.querySelector(".js-phone-number").textContent = identifier;

  const form = document.querySelector(".create-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // MUST always stop refresh

    const otpInput = document.querySelector(".js-otp-input");

    if (!otpInput) return;

    const otp = otpInput.value.trim();

    console.log("identifier:", identifier);
    console.log("otp:", otp);

    if (!identifier) {
      alert("Session expired. Please restart.");
      window.location.replace = "login.html";
      return;
    }

    if (!otp || otp.length !== 6) {
      alert("Enter 6-digit code");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim()
        })
      });

      const data = await res.json();

      console.log("response:", data);

      if (!res.ok || !data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      // IMPORTANT: prevents “blink / back behavior”
      window.location.replace("accsuccess.html");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

  });

});
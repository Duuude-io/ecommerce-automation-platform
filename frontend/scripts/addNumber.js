document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector(".js-mobile-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const country = document.querySelector(".js-country-code").value;
    const phone = document.querySelector(".js-phone-input").value.trim();

    const identifier = localStorage.getItem("identifier");

    if (!phone) {
      alert("Enter mobile number");
      return;
    }

    const countryCode = country.match(/\+\d+/)[0];
    const fullPhone = `${countryCode}${phone}`;

    try {

      // 1. CHECK IF PHONE ALREADY EXISTS
      const checkRes = await fetch("http://127.0.0.1:8000/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: fullPhone })
      });

      const checkData = await checkRes.json();

      if (checkData.userExists) {
        alert("This number is already linked to an account. Please login or use another number.");

        return;
      }

      // 2. SAVE PHONE TO USER
      const addRes = await fetch("http://127.0.0.1:8000/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          phone: fullPhone
        })
      });

      const addData = await addRes.json();

      if (!addRes.ok || addData.error) {
        alert(addData.error || "Failed to add phone");
        return;
      }

      // 3. SEND OTP
      const otpRes = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: fullPhone,
          purpose: "add_phone"
        })
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok || !otpData.success) {
        alert("Failed to send OTP");
        return;
      }

      // 4. UPDATE STATE
      localStorage.setItem("identifier", fullPhone);
      localStorage.setItem("authType", "phone");

      // 5. REDIRECT
      window.location.href = "numberverify.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

  });

});

const skipLink = document.querySelector(".js-skip-verification");

skipLink?.addEventListener("click", (e) => {
  e.preventDefault();

  window.location.href = "amazon.html";
});
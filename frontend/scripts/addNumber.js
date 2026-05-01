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
        alert("User already exists. Please login instead.");
        window.location.href = "login.html";
        return;
      }

      // 2. SAVE PHONE TO USER
      await fetch("http://127.0.0.1:8000/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          phone: fullPhone
        })
      });

      // 3. SEND OTP
      await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: fullPhone
        })
      });

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
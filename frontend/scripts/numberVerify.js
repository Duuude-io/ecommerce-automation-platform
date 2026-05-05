import { routeUser } from "./authRouter.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector(".create-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("FORM SUBMITTED");

    const otpInput = document.querySelector(".js-otp-input");
    const otp = otpInput.value.trim();
    const userId = localStorage.getItem("userId");

    console.log("userId:", userId);
    console.log("otp:", otp);

    if (!userId) {
      alert("Session expired");
      window.location.href = "login.html";
      return;
    }

    if (!otp || otp.length !== 6) {
      alert("Enter 6-digit OTP");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          otp,
          purpose: "signup"
        })
      });

      const data = await res.json();

      console.log("response:", data);

      if (!res.ok || !data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId || userId);
        localStorage.setItem("nextStep", data.nextStep || "done");

        await routeUser();
      }

    } catch (err) {
      console.error("ERROR:", err);
      alert("Server error");
    }
  });
});
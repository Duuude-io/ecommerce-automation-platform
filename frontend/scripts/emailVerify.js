document.addEventListener("DOMContentLoaded", () => {
  const identifier = localStorage.getItem("identifier");
  const label = document.querySelector(".js-user-identifier");
  const button = document.querySelector(".primary-button");
  const resendLink = document.querySelector(".js-resend-otp");

  if (label && identifier) {
    label.textContent = `${identifier}`;
  }

  if (button) {
    button.addEventListener("click", async () => {
      const otp = document.querySelector(".js-otp-input").value.trim();

      if (!identifier) {
        alert("Session expired. Please start again.");
        window.location.href = "login.html";
        return;
      }

      if (!otp) {
        alert("Enter OTP");
        return;
      }

      try {
        console.log("identifier:", identifier);
        console.log("otp:", otp);

        const res = await fetch("http://127.0.0.1:8000/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: identifier.trim(),
            otp: otp.trim()
          })
        });

        const data = await res.json();
        console.log("verify response:", data);

        if (!data.success) {
          alert(data.message || "Invalid OTP");
          return;
        }

        window.location.href = "addnumber.html";
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }

  if (resendLink) {
    resendLink.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!identifier) {
        alert("Session expired. Please start again.");
        window.location.href = "login.html";
        return;
      }

      try {
        resendLink.textContent = "Sending...";
        resendLink.style.pointerEvents = "none";

        await fetch("http://127.0.0.1:8000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: identifier.trim() })
        });

        resendLink.textContent = "Code sent ✔";

        setTimeout(() => {
          resendLink.textContent = "Resend code";
          resendLink.style.pointerEvents = "auto";
        }, 5000);
      } catch (err) {
        console.error(err);
        resendLink.textContent = "Resend code";
        resendLink.style.pointerEvents = "auto";
      }
    });
  }
});
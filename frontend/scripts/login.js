console.log("Login js loaded");

document.querySelector('.js-login-form')
  .addEventListener('submit', async (event) => {

    event.preventDefault();

    const identifier =
      document.querySelector('#number-email').value.trim();

    try {
      console.log("Sending to backend:", identifier);

      // check user
      const response = await fetch(
        'http://127.0.0.1:8000/check-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ identifier })
        }

      );

      console.log(JSON.stringify({ identifier }));

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem('identifier', identifier);

      // EXISTING USER FLOW
      if (data.userExists) {

        // STEP 2: trigger OTP send
        const otpResponse = await fetch(
          'http://127.0.0.1:8000/send-otp',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier })
          }
        );

        const otpData = await otpResponse.json();

        if (!otpResponse.ok) {
          alert(otpData.error || "Failed to send OTP");
          return;
        }

        // redirect to verification page
        window.location.href = "userexistpage.html";

      } else {
        // NEW USER FLOW
        window.location.href = "loginauth.html";
      }

    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }

  });
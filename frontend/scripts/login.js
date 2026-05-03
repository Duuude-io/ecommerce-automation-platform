console.log("Login JS loaded");

document.querySelector(".js-login-form")
  .addEventListener("submit", async (event) => {

    event.preventDefault();

    const identifier =
      document.querySelector("#number-email")
        .value
        .trim()
        .toLowerCase();

    if (!identifier) {
      alert("Enter email or phone");
      return;
    }

    try {

      console.log("Checking user:", identifier);

      const response = await fetch(
        "http://127.0.0.1:8000/check-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ identifier })
        }
      );

      const data = await response.json();

      console.log("check-user response:", data);

      // save session identifier
      localStorage.setItem("identifier", identifier);

      //  EXISTING USER
      if (data.userExists) {
        window.location.href = "userexistpage.html";
      }

      //  NEW USER
      else {
        window.location.href = "loginauth.html";
      }

    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }

  });
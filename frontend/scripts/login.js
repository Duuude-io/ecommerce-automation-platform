console.log("Login js loaded")
document.querySelector('#loginBtn')
  .addEventListener('click', async () => {

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const response = await fetch('http://127.0.0.1:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data); // IMPORTANT DEBUG

    if (!response.ok || !data.token) {
      alert(data.error || "Login failed");
      return;
    }

    // SAVE TOKEN CORRECTLY
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);

    console.log("TOKEN SAVED:", localStorage.getItem('token'));

    alert("Login successful!");
    window.location.href = "payment.html";
  });
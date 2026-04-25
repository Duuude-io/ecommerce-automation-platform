document.querySelector('#signupBtn')
  .addEventListener('click', async () => {

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const response = await fetch('http://127.0.0.1:8000/signup', {
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

    alert(data.message);
  });
const uri = window.APP_URI;
const signupForm = document.querySelector('.signup');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.querySelector('.email').value;
  const password = document.querySelector('.password').value;
  const address = document.querySelector('.address').value;

  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ email, password, address }),
  };

  // Making the fetch Request
  try {
    const res = await fetch(`${uri}/auth/signup`, options);
    const result = await res.json();
    if (res.status !== 200) toast('danger', result.message);
    if (result.token) {
      const { token } = result;
      localStorage.setItem('token', token);
      flash({ type: 'success', message: 'Sign up successful' });
      window.location.href = '/order';
    }
  } catch (e) {
    toast('danger', e);
  }
});

window.onload = () => {
  // Check if token exist
  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');
    const payload = token.split('.')[1];
    const data = JSON.parse(window.atob(payload));
    const expires = data.exp;
    const currentDate = Math.floor((Date.now() / 1000)); // Convert date to seconds

    // Check if the token has expired or not
    if (expires > currentDate) {
      window.location.href = '/order';
    } else {
      // Remove token if expired
      localStorage.removeItem('token');
    }
  }
};

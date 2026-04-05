import { isAuthenticated, loginUser } from './auth.mjs';
import { alertMessage } from './utils.mjs';

const loginForm = document.getElementById('loginForm');

function getRedirectPath() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || '/orders/index.html';
}

if (isAuthenticated()) {
  window.location.assign(getRedirectPath());
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isValid = loginForm.checkValidity();
    loginForm.reportValidity();

    if (!isValid) {
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing In...';

    try {
      await loginUser({
        email: loginForm.elements.email.value.trim(),
        password: loginForm.elements.password.value,
      });
      window.location.assign(getRedirectPath());
    } catch (error) {
      alertMessage(error.message || 'Unable to sign in right now.');
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
    }
  });
}

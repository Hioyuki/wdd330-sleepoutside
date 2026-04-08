import ExternalServices from './ExternalServices.mjs';
import { saveCustomer } from './customer.mjs';
import { alertMessage } from './utils.mjs';

const registerForm = document.getElementById('registerForm');

function formToJSON(form) {
  const formData = new FormData(form);
  const payload = {};

  formData.forEach((value, key) => {
    payload[key] = value.trim();
  });

  return payload;
}

function normalizeCustomer(payload, response) {
  const customer = response?.user || response?.data || response || {};

  return {
    ...customer,
    name: [payload.fname, payload.lname].filter(Boolean).join(' '),
    fname: payload.fname,
    lname: payload.lname,
    street: payload.street,
    city: payload.city,
    state: payload.state,
    zip: payload.zip,
    email: payload.email,
    avatar: payload.avatar,
  };
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isValid = registerForm.checkValidity();
    registerForm.reportValidity();

    if (!isValid) {
      return;
    }

    const payload = formToJSON(registerForm);
    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
      const services = new ExternalServices();
      const response = await services.registerUser(payload);
      saveCustomer(normalizeCustomer(payload, response));
      window.location.assign('../wishlist/index.html');
    } catch (error) {
      alertMessage(
        error.message?.message ||
          error.message ||
          'Unable to create your account right now.',
      );
      submitButton.disabled = false;
      submitButton.textContent = 'Create Account';
    }
  });
}

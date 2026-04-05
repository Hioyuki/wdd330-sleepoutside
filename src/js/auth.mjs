import ExternalServices from './ExternalServices.mjs';

const AUTH_KEY = 'so-auth';

export function getAuth() {
  return JSON.parse(localStorage.getItem(AUTH_KEY));
}

export function getToken() {
  return getAuth()?.token || '';
}

export function saveAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function requireAuth(loginPath = '../login/index.html') {
  if (isAuthenticated()) {
    return true;
  }

  const redirect = encodeURIComponent(window.location.pathname);
  window.location.assign(`${loginPath}?redirect=${redirect}`);
  return false;
}

export function extractToken(payload) {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return (
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    ''
  );
}

export async function loginUser(credentials) {
  const services = new ExternalServices();
  const response = await services.login(credentials);
  const token = extractToken(response);

  if (!token) {
    throw new Error('Login succeeded but no token was returned.');
  }

  const auth = {
    token,
    email: credentials.email,
    user: response.user || response.data?.user || null,
  };

  saveAuth(auth);
  return auth;
}

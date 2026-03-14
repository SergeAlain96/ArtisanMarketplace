const TOKEN_KEY = 'artisan_marketplace_token';
const ROLE_KEY = 'artisan_marketplace_role';

function readCookie(name) {
  if (globalThis.window === undefined) return '';

  const cookiePair = globalThis.document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookiePair ? decodeURIComponent(cookiePair.split('=')[1]) : '';
}

function writeCookie(name, value) {
  if (globalThis.window === undefined) return;
  globalThis.document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

function clearCookie(name) {
  if (globalThis.window === undefined) return;
  globalThis.document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getToken() {
  if (globalThis.window === undefined) return '';
  return globalThis.localStorage.getItem(TOKEN_KEY) || readCookie(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.setItem(TOKEN_KEY, token);
  writeCookie(TOKEN_KEY, token);
}

export function clearToken() {
  if (globalThis.window === undefined) return;
  globalThis.localStorage.removeItem(TOKEN_KEY);
  clearCookie(TOKEN_KEY);
  clearCookie(ROLE_KEY);
}

export function getRole() {
  if (globalThis.window === undefined) return '';
  return globalThis.localStorage.getItem(ROLE_KEY) || readCookie(ROLE_KEY) || '';
}

export function setSession(token, role) {
  setToken(token);
  if (globalThis.window === undefined) return;

  if (role) {
    globalThis.localStorage.setItem(ROLE_KEY, role);
    writeCookie(ROLE_KEY, role);
  }
}

export function clearSession() {
  if (globalThis.window !== undefined) {
    globalThis.localStorage.removeItem(ROLE_KEY);
  }

  clearToken();
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Centralised browser-side auth token handling.
// Tokens live in localStorage (for Authorization headers) and in an
// access_token cookie (so the Next.js middleware can guard /panel and /admin).
// Keeping both in sync here prevents the "logged out but still let in" and
// "let in but every request 401s" classes of bugs.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setAuth(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `access_token=${accessToken}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'access_token=; Path=/; Max-Age=0; SameSite=Lax';
}

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

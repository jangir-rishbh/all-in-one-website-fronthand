/** Open-redirect safe: only same-origin relative paths. */
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  return t;
}

/** Logged-in user hits /login — honor `redirectedFrom` when allowed. */
export function pathWhenAlreadyLoggedIn(
  redirectedFrom: string | null,
  role: 'admin' | 'user' | undefined
): string {
  const path = safeRedirectPath(redirectedFrom);
  if (path) {
    // Only block when we *know* they are a normal user. `undefined` = stale client data — let /admin load and AdminGate + /api/auth/me decide.
    if (path.startsWith('/admin') && role === 'user') return '/home';
    return path;
  }
  return '/home';
}

/** After successful password/OTP login. */
export function pathAfterLogin(redirectTo: string, role: 'admin' | 'user'): string {
  const p = safeRedirectPath(redirectTo);
  if (role === 'admin') {
    if (p?.startsWith('/admin')) return p;
    return '/admin/welcome';
  }
  if (p?.startsWith('/admin')) return '/home';
  return p ?? '/home';
}

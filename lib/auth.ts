import { cookies } from 'next/headers';
import { verifySession, SessionPayload } from '@/lib/session';

function apiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!v) {
    throw new Error('NEXT_PUBLIC_API_URL is required in .env.local');
  }
  return v.replace(/\/$/, '');
}

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
  mobile?: string | null;
  gender?: string | null;
  state?: string | null;
  role: 'admin' | 'user';
  two_factor_enabled?: boolean;
} | null;

/** Server-side user: Express `custom_token` cookie or legacy `session` / `session_token`. */
export async function getCurrentUserFromCookie(): Promise<CurrentUser> {
  const store = await cookies();
  const hasAuthCookie = Boolean(
    store.get('custom_token')?.value ||
      store.get('session_token')?.value ||
      store.get('session')?.value
  );
  if (!hasAuthCookie) return null;

  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const url = `${apiBaseUrl()}/api/auth/me`;
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: CurrentUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  if (user.role !== 'admin') {
    throw new Response('Forbidden', { status: 403 });
  }
  return user;
}

export async function extractSessionFromRequestCookie(
  req: Request
): Promise<SessionPayload | null> {
  const cookie = req.headers.get('cookie') || '';
  const sessionMatch = cookie.match(/(?:^|; )session=([^;]+)/);
  const token = sessionMatch ? decodeURIComponent(sessionMatch[1]) : '';
  return token ? await verifySession(token) : null;
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function apiBase(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!v) throw new Error('NEXT_PUBLIC_API_URL is required');
  return v.replace(/\/$/, '');
}

/** Node route: middleware calls this same-origin so Edge does not fetch localhost:backend directly. */
export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const raw = request.cookies.get('custom_token')?.value;
  let bearer: string | undefined;
  if (raw) {
    try {
      bearer = decodeURIComponent(raw);
    } catch {
      bearer = raw;
    }
  }

  const upstream = await fetch(`${apiBase()}/api/auth/me`, {
    cache: 'no-store',
    headers: {
      Cookie: cookie,
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
    },
  });
}

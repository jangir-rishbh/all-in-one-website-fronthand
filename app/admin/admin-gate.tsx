'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminClientWrapper from './admin-client-wrapper';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/massage', label: 'Massage' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/profile', label: 'Profile' },
];

export default function AdminGate({ children }: { children: ReactNode }) {
  const { session, loading, refreshSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  /** Wait for auth init + fresh /api/auth/me so stale localStorage role does not redirect early */
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      try {
        await refreshSession();
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setVerified(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after auth is ready
  }, [loading]);

  useEffect(() => {
    if (!verified || loading) return;
    if (!session) {
      const from = pathname && pathname.startsWith('/admin') ? pathname : '/admin/dashboard';
      router.replace(`/login?redirectedFrom=${encodeURIComponent(from)}`);
      return;
    }
    // Only reject when role is explicitly "user". Undefined = stale object; /api/auth/me should have set role after refreshSession above.
    if (session.role === 'user') {
      const from = pathname && pathname.startsWith('/admin') ? pathname : '/admin/dashboard';
      router.replace(`/login?redirectedFrom=${encodeURIComponent(from)}`);
    }
  }, [session, loading, verified, router, pathname]);

  if (loading || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm">Redirecting…</p>
        </div>
      </div>
    );
  }

  if (session.role === 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm">Redirecting…</p>
        </div>
      </div>
    );
  }

  if (session.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm">Checking permissions…</p>
        </div>
      </div>
    );
  }

  const user = {
    id: session.id || session.email,
    email: session.email,
    name: session.name ?? null,
    mobile: session.mobile ?? null,
    gender: session.gender ?? null,
    state: session.state ?? null,
    role: 'admin' as const,
    two_factor_enabled: session.two_factor_enabled,
  };

  return (
    <AdminClientWrapper navItems={NAV_ITEMS} user={user}>
      {children}
    </AdminClientWrapper>
  );
}

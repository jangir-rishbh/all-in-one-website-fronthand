'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import type { Locale } from '@/context/I18nContext';

export default function SettingsPage() {
  const { session, loading, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [userState, setUserState] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<'profile' | 'security'>('profile');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');


  useEffect(() => {
    if (session) {
      setName(session.name || '');
      setMobile(session.mobile || '');
      setGender(session.gender || null);
      setUserState(session.state || null);
    }
  }, [session, loading, router]);

  // Apply theme helper
  const applyTheme = (next: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const el = document.documentElement;
      el.classList.remove('light', 'dark');
      el.classList.add(next);
    }
    try { localStorage.setItem('theme', next); } catch {}
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/home');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // Load theme from preferences or localStorage
  useEffect(() => {
    // Prefer localStorage immediately for snappy UI
    try {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
        applyTheme(stored);
      }
    } catch {}

    // If authenticated, fetch server preferences
    (async () => {
      if (loading || !session) return;
      try {
        const resp = await fetch('/api/preferences', { cache: 'no-store' });
        const data = await resp.json();
        const prefTheme = data?.preferences?.theme as 'light' | 'dark' | null;
        if (prefTheme === 'light' || prefTheme === 'dark') {
          setTheme(prefTheme);
          applyTheme(prefTheme);
        }
      } catch {}
    })();
  }, [loading, session]);

  const handleThemeChange = async (next: 'light' | 'dark') => {
    setTheme(next);
    applyTheme(next);
    // Persist to server preferences (best-effort) only if authenticated
    if (session) {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: next })
        });
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await updateProfile({
        name: name?.trim() || '',
        mobile: mobile?.trim() || undefined,
        gender: gender || undefined,
        state: userState || undefined,
      });
      if (!result.success) throw new Error(result.error || 'Update failed');
      setSuccess('Profile updated successfully');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{t('settings')}</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your account security and preferences</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('settings')}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {session ? 'Manage your account security and preferences.' : 'Customize your preferences.'}
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded bg-red-50 text-red-700 p-3">{error}</div>
            )}
            {success && (
              <div className="mb-4 rounded bg-green-50 text-green-700 p-3">{success}</div>
            )}

            <div className="space-y-6">
              {/* Language Preference (available to all) */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('language')}</h4>
                <p className="text-sm text-gray-600 mb-4">Choose your preferred website language.</p>
                <div className="flex items-center gap-3">
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    aria-label={t('language')}
                  >
                    <option value="en">{t('english')}</option>
                    <option value="hi">{t('hindi')}</option>
                  </select>
                </div>

                {/* Theme Preference (available to all) */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Theme</h4>
                  <p className="text-sm text-gray-600 mb-4">Switch between Light and Dark mode.</p>
                  <div className="flex items-center gap-3">
                    <select
                      value={theme}
                      onChange={(e) => handleThemeChange((e.target.value as 'light' | 'dark'))}
                      className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      aria-label="Theme"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>

              {session && (
                <>
                  {/* Notification Settings */}
                  <NotificationSection />

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={() => router.back()}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      {t('back')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight client component for Notifications
function NotificationSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email_offers, setEmailOffers] = useState(true);
  const [email_orders, setEmailOrders] = useState(true);
  const [sms_updates, setSmsUpdates] = useState(false);
  const [whatsapp_updates, setWhatsappUpdates] = useState(false);
  const [push_enabled, setPushEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/notifications', { cache: 'no-store' });
        const data = await resp.json();
        const n = data?.notifications;
        if (n) {
          setEmailOffers(!!n.email_offers);
          setEmailOrders(!!n.email_orders);
          setSmsUpdates(!!n.sms_updates);
          setWhatsappUpdates(!!n.whatsapp_updates);
          setPushEnabled(!!n.push_enabled);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_offers, email_orders, sms_updates, whatsapp_updates, push_enabled })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to save notifications');
      setSuccess('Notification settings saved');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save notifications';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h4>
      {error && <div className="mb-3 rounded bg-red-50 text-red-700 p-2 text-sm">{error}</div>}
      {success && <div className="mb-3 rounded bg-green-50 text-green-700 p-2 text-sm">{success}</div>}
      {loading ? (
        <div className="text-gray-500">Loading notification settings...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={email_offers} onChange={(e) => setEmailOffers(e.target.checked)} /> Email: Offers & Sales</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={email_orders} onChange={(e) => setEmailOrders(e.target.checked)} /> Email: Order Updates</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={sms_updates} onChange={(e) => setSmsUpdates(e.target.checked)} /> SMS Updates</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={whatsapp_updates} onChange={(e) => setWhatsappUpdates(e.target.checked)} /> WhatsApp Updates</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={push_enabled} onChange={(e) => setPushEnabled(e.target.checked)} /> Push Notifications</label>
          <div className="sm:col-span-2 flex justify-end">
            <button onClick={save} disabled={saving} className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>{saving ? 'Saving...' : 'Save Notification Settings'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

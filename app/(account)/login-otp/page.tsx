"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { pathAfterLogin, pathWhenAlreadyLoggedIn } from '@/lib/post-login-redirect';

export default function LoginOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, refreshSession, verifyOtp: ctxVerifyOtp } = useAuth();

  const email = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirectedFrom') || '/home';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!session) return;
    router.replace(pathWhenAlreadyLoggedIn(searchParams.get('redirectedFrom'), session.role));
  }, [session, router, searchParams]);

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.sendOtp({ email, purpose: 'login' });
      setOtpSent(true);
      setSuccess('OTP sent to your email.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const otpValue = otp.replace(/[^0-9]/g, '');
      if (otpValue.length !== 6) {
        throw new Error('Please enter 6-digit OTP');
      }

      const res = await ctxVerifyOtp(email, otpValue);

      if (!res.success) {
        throw new Error(res.error || 'Verification failed');
      }

      const role = (res.data?.user?.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user';
      router.replace(pathAfterLogin(redirectTo, role));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 dark:text-gray-100 transform transition-all duration-500 hover:shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            Login with OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {email}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {!otpSent ? (
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border-0 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border-0 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-2 text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                Resend OTP
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => router.push('/login?reset=1')}
            className="w-full py-2 text-sm text-gray-700 dark:text-gray-300 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}

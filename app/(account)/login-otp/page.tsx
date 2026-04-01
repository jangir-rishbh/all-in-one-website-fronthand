"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { pathAfterLogin, pathWhenAlreadyLoggedIn } from '@/lib/post-login-redirect';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, refreshSession, verifyOtp: ctxVerifyOtp } = useAuth();

  const email = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirectedFrom') || '/home';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!session) return;
    router.replace(pathWhenAlreadyLoggedIn(searchParams.get('redirectedFrom'), session.role));
  }, [session, router, searchParams]);

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    
    // Focus next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.sendOtp({ email, purpose: 'login' });
      setOtpSent(true);
      setSuccess('OTP sent to your email.');
      setResendDisabled(true);
      setResendCountdown(30);
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
      const otpValue = otp.join('');
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

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/30 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <motion.div 
               initial={{ y: -10, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               transition={{ delay: 0.1 }}
            >
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                Login Verification
              </h2>
              <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                {otpSent ? "We've sent a 6-digit code to" : "Continue with"}
                <br />
                <span className="text-gray-900 dark:text-gray-100 font-semibold">{email}</span>
              </p>
            </motion.div>
          </div>

          {(error || success) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                error 
                  ? 'bg-red-50/80 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' 
                  : 'bg-green-50/80 border-green-100 text-green-600 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {error ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                )}
                <span>{error || success}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {!otpSent ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="space-y-5"
              >
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm shadow-inner text-center border border-indigo-100 dark:border-indigo-800/30">
                  Click below to receive a one-time verify code on your email.
                </div>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className={`relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading 
                      ? 'bg-gray-400 dark:bg-gray-700 shadow-none cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Sending Code...
                    </>
                  ) : (
                    'Send OTP Code'
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.3 }}
                onSubmit={verifyOtp} 
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={loading}
                        className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all duration-200 disabled:opacity-50 focus:scale-[1.05]"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <button
                    type="submit"
                    disabled={loading || !isOtpComplete}
                    className={`relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200 ${
                      loading || !isOtpComplete
                        ? 'bg-gray-400 dark:bg-gray-700 shadow-none cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </button>

                  <div className="flex justify-center items-center text-sm font-medium">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={resendDisabled || loading}
                      className={`transition-colors duration-200 ${
                        resendDisabled || loading
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300'
                      }`}
                    >
                      {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/login?reset=1"
                className="group flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

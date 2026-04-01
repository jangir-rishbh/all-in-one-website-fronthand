"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();

  const email = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirectedFrom') || '/home';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const verifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) {
        throw new Error('Please enter 6-digit OTP');
      }

      const data = await api.verifyEmail(email, otpValue);

      if (!data.success) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setShowPasswordForm(true);
      setSuccess('OTP verified! Please set your password to complete account creation.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('pendingUser='))
        ?.split('=')[1];
      
      if (!cookieValue) {
        throw new Error('Registration session expired. Please start over.');
      }

      const pendingUser = JSON.parse(decodeURIComponent(cookieValue));
      
      const data = await api.completeSignup({
        email: pendingUser.email,
        password: newPassword,
        name: pendingUser.name,
        mobile: pendingUser.mobile,
        gender: pendingUser.gender,
        state: pendingUser.state
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to complete signup');
      }

      setVerificationComplete(true);
      setSuccess('Account created successfully! Redirecting...');
      
      document.cookie = "pendingUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&registered=1`);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendCountdown(60);
    setError(null);

    try {
      const data = await api.sendSignupVerification(email);

      if (!data.success) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent to your email.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl opacity-50"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/30 dark:border-gray-800">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {showPasswordForm ? "Set Password" : "Verify Email"}
            </h2>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              {showPasswordForm 
                ? "Secure your brand new account" 
                : `We've sent a 6-digit code to`}
              <br />
              <span className="text-gray-900 dark:text-gray-100 font-semibold">{email}</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 ${
                  error 
                    ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' 
                    : 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400'
                }`}
              >
                {error ? (
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{error || success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {!showPasswordForm && !verificationComplete ? (
              <form onSubmit={verifyOtp} className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                    Enter 6-digit verification code
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
                        className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 disabled:opacity-50 focus:scale-[1.05]"
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
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <div className="flex justify-center items-center text-sm font-medium">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Didn't get the code?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendDisabled || loading}
                      className={`transition-colors duration-200 ${
                        resendDisabled || loading
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                      }`}
                    >
                      {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </form>
            ) : showPasswordForm && !verificationComplete ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (password === confirmPassword) {
                    completeSignup(password);
                  } else {
                    setError('Passwords do not match');
                  }
                }}
                className="space-y-5"
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 pr-12"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 pr-12"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className={`relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200 ${
                    loading || !password || !confirmPassword
                      ? 'bg-gray-400 dark:bg-gray-700 shadow-none cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Signup'
                  )}
                </button>
              </form>
            ) : null}

            {verificationComplete && (
              <div className="py-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Welcome Aboard!</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Account created successfully. Redirecting you to the login page...
                </p>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

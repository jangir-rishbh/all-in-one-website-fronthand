'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset, 3: Success
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const fromQuery = searchParams.get('email')?.trim();
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email address', isError: true });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setMessage({ text: data.error || 'No account found with this email address', isError: true });
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage({ 
        text: 'A verification code has been sent to your email.', 
        isError: false 
      });
      setStep(2);
      setResendCountdown(30);
      setResendDisabled(true);
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to send OTP', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setMessage({ text: 'Please enter the 6-digit verification code', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', isError: true });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', isError: true });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage({ 
        text: 'Password reset successful!', 
        isError: false 
      });
      setStep(3);
      
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to reset password', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtpArr = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtpArr);
    
    const nextEmptyIndex = newOtpArr.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "linear" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 font-sans relative overflow-hidden">
      
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl opacity-50"></div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/30 dark:border-gray-800">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {step === 1 ? 'Password Recovery' : step === 2 ? 'Security Check' : 'Success!'}
            </h2>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              {step === 1 
                ? 'Enter your email to receive a recovery code' 
                : step === 2 
                  ? 'Verifying your identity for security' 
                  : 'Your account is now secure'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-start gap-3 ${
                  message.isError 
                    ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' 
                    : 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400'
                }`}
              >
                {message.isError ? (
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <motion.form 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              onSubmit={handleRequestOtp} 
              className="space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-600">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200 placeholder-gray-400"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200 active:scale-[0.98] ${
                  loading 
                    ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Sending Code...
                  </>
                ) : (
                  'Get Reset Code'
                )}
              </button>
            </motion.form>
          ) : step === 2 ? (
            <motion.form 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              onSubmit={handleResetPassword} 
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      disabled={loading}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 disabled:opacity-50 focus:scale-[1.05]"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-green-500" />
                  Code sent to {email}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-purple-600">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-purple-600">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || !otp.join('') || !newPassword || !confirmPassword}
                  className={`w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200 active:scale-[0.98] ${
                    loading || !otp.join('') || !newPassword || !confirmPassword
                      ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                  <div className="flex justify-center items-center text-sm font-medium">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={resendDisabled || loading}
                      className={`transition-colors duration-200 ${
                        resendDisabled || loading
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                      }`}
                    >
                      {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setMessage({ text: '', isError: false });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    <ArrowLeft size={16} /> Back to Email
                  </button>
                </div>
              </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center py-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Great Success!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[250px] mx-auto">
                Your password has been updated. Redirecting you to login...
              </p>
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <Link 
              href="/login" 
              className="group flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


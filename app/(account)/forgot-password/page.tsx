'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: success
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fromQuery = searchParams.get('email')?.trim();
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

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
          // Show specific error for email not found
          setMessage({ text: data.error || 'No account found with this email address', isError: true });
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage({ 
        text: 'A 6-digit OTP has been sent to your email. Please check your inbox.', 
        isError: false 
      });
      setStep(2);
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
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage({ 
        text: 'Password has been reset successfully! Redirecting to login...', 
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

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === stepNum 
                ? 'bg-purple-600 text-white' 
                : step > stepNum 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'}`}
          >
            {step > stepNum ? <FiCheckCircle size={18} /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`h-1 w-12 mx-1 ${step > stepNum ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/4 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-serif italic font-bold text-gray-800 leading-tight">
                <span className="text-yellow-500">Ma Baba</span>
                <span className="text-gray-800"> Cloth Store</span>
              </span>
              <span className="text-xs font-sans not-italic text-gray-500 mt-1">Elegant Clothing & Fashion</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {step === 1 ? 'Reset Your Password' : step === 2 ? 'Verify Your Identity' : 'All Set!'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {step === 1 
              ? 'Enter your email to receive a verification code' 
              : step === 2 
                ? 'Enter the 6-digit code sent to your email' 
                : 'Your password has been reset successfully'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900/80 py-8 px-4 shadow-xl rounded-xl sm:px-10 relative overflow-hidden border border-white/20 dark:border-gray-700 dark:text-gray-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          
          {step === 3 ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FiCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Password Reset Successful!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">You can now log in with your new password.</p>
              <Link 
                href="/login" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              {renderStepIndicator()}
              
              {message.text && (
                <div 
                  className={`mb-6 p-4 rounded-md ${
                    message.isError 
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40' 
                      : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              {step === 1 ? (
                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-3 border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Verification Code
                      </label>
                      <div className="mt-1">
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          pattern="\d{6}"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full px-4 py-3 sm:text-sm border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                          placeholder="000000"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to {email}</p>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-3 border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-3 border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || !otp || !newPassword || !confirmPassword}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ${
                        loading || !otp || !newPassword || !confirmPassword ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setMessage({ text: '', isError: false });
                      }}
                      className="w-full flex justify-center py-2 px-4 text-sm font-medium text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <FiArrowLeft className="mr-1 h-4 w-4 mt-0.5" /> Back to Email
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
                  Remembered your password?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link 
                href="/login" 
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

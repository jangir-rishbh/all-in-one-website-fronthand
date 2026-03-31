'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import api from '@/lib/api';

export default function ChangePasswordPage() {
  const { session, loading: authLoading } = useAuth();
  const [websiteInfo, setWebsiteInfo] = useState({ name: 'Ma Baba Cloth Store', logoUrl: '' });
  const { t } = useI18n();
  const router = useRouter();

  // Fetch website identity info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.getWebsiteInfo();
        if (res.success && res.websiteInfo) {
          setWebsiteInfo(res.websiteInfo);
        }
      } catch (err) {
        console.error('Failed to fetch website info:', err);
      }
    };
    fetchInfo();
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login?redirect=/change-password');
    }
  }, [session, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', isError: true });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters', isError: true });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ text: 'New password must be different from the current one', isError: true });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      const token = localStorage.getItem('custom_token') || '';
      const response = await api.changePassword(
        { currentPassword, newPassword },
        token
      );

      if (response.error) {
        throw new Error(response.error || 'Failed to change password');
      }

      setSuccess(true);
      setMessage({ 
        text: response.message || 'Password changed successfully!', 
        isError: false 
      });
      
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect after 3 seconds
      setTimeout(() => router.push('/home'), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to change password', 
        isError: true 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/4 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/home" className="inline-block">
            <div className="flex flex-col items-center">
              {websiteInfo.logoUrl ? (
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 mb-4 overflow-hidden border border-gray-100 ring-2 ring-blue-50">
                  <img src={websiteInfo.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <span className="text-3xl font-serif italic font-bold leading-tight drop-shadow-sm">
                  <span className="text-yellow-500">
                    {websiteInfo.name === 'Ma Baba Cloth Store' ? 'Ma Baba' : websiteInfo.name?.split(' ')[0]}
                  </span>
                  <span className="text-gray-800">
                    {websiteInfo.name === 'Ma Baba Cloth Store' ? ' cloth store' : ' ' + (websiteInfo.name?.split(' ').slice(1).join(' ') || '')}
                  </span>
                </span>
              )}
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('changePassword')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Secure your account by updating your password regularly
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900/80 py-8 px-4 shadow-xl rounded-xl sm:px-10 relative overflow-hidden border border-white/20 dark:border-gray-700 dark:text-gray-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FiCheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{message.text}</p>
              <p className="text-sm text-gray-500">Redirecting you back to home...</p>
              <Link 
                href="/home" 
                className="mt-6 inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
              >
                <FiArrowLeft className="mr-2" /> Back to Home
              </Link>
            </div>
          ) : (
            <>
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

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="currentPassword" title="current password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-3 border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label htmlFor="newPassword" title="new password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" title="confirm new password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md py-3 border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800/60 placeholder-gray-400 dark:placeholder-gray-400"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 ${
                      loading || !currentPassword || !newPassword || !confirmPassword ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </>
          )}
          
          <div className="mt-6 flex justify-center">
            <Link 
              href="/home" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
            >
              <FiArrowLeft className="mr-1" /> Not now, go to Home
            </Link>
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

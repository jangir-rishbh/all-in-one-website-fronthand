"use client";

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Gender = 'male' | 'female' | 'other' | '';

type Bubble = {
  left: string;
  size: string;
  duration: string;
  delay: string;
  scale: string;
};

type CSSVars = {
  ['--left']?: string;
  ['--size']?: string;
  ['--duration']?: string;
  ['--scale']?: string;
};

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
].sort();

type FormData = {
  email: string;
  name: string;
  mobile: string;
  gender: Gender;
  state: string;
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    mobile: '',
    gender: '',
    state: ''
  });
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // Check if user is already logged in
  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  // Pre-fill email from URL parameter if available
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        email: decodeURIComponent(emailFromUrl)
      }));
    }
  }, [searchParams]);

  // Generate bubbles once on mount (client-only)
  useEffect(() => {
    const count = 18;
    const items: Bubble[] = Array.from({ length: count }).map(() => {
      const left = `${Math.floor(Math.random() * 100)}%`;
      const sizePx = 18 + Math.floor(Math.random() * 28); // 18-46px (bigger bubbles)
      const durationSec = 12 + Math.floor(Math.random() * 12); // 12-24s
      const delaySec = Math.floor(Math.random() * 12); // 0-12s
      const scale = (0.8 + Math.random() * 0.8).toFixed(2); // 0.8-1.6
      return {
        left,
        size: `${sizePx}px`,
        duration: `${durationSec}s`,
        delay: `${delaySec}s`,
        scale: `${scale}`,
      };
    });
    setBubbles(items);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('Validating details and sending verification email...');

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      
      if (!formData.email) {
        throw new Error('Email is required');
      }

      if (!formData.mobile) {
        throw new Error('Mobile number is required');
      }

      // Validate mobile number format (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobile)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      if (!formData.gender) {
        throw new Error('Please select your gender');
      }

      if (!formData.state) {
        throw new Error('Please select your state');
      }
      
      // Prepare OTP request data
      const otpRequestData = {
        name: formData.name.trim(),
        purpose: 'signup_verification',
        email: formData.email,
        mobile: formData.mobile
      };

      // Send verification OTP to new user
      await api.sendSignupVerification(formData.email);

      // Store user data in cookie for after verification
      const userData = {
        email: formData.email,
        name: formData.name.trim(),
        mobile: formData.mobile,
        gender: formData.gender,
        state: formData.state
      };
      document.cookie = `pendingUser=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=3600; SameSite=lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

      // Redirect to verify-otp page
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (errorMessage.includes('already registered')) {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      {/* Floating bubbles background layer */}
      <div className="bubble-layer" aria-hidden="true">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              ['--left']: b.left,
              ['--size']: b.size,
              ['--duration']: b.duration,
              ['--scale']: b.scale,
              animationDelay: b.delay,
            } as CSSProperties & CSSVars}
          />
        ))}
      </div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 max-w-xl w-full space-y-8 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 dark:text-gray-100 transform transition-all duration-500 hover:shadow-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h2 
            className="text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            Create a new account
          </motion.h2>
          <motion.p 
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Already have an account?{' '}
            <Link 
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 focus:outline-none"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-md bg-red-50 dark:bg-red-900/30 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <motion.svg 
                    className="h-5 w-5 text-red-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </motion.svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-md bg-green-50 dark:bg-green-900/30 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <motion.svg 
                    className="h-5 w-5 text-green-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </motion.svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">{success}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          onSubmit={handleSubmit} 
          className="mt-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="rounded-md shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="col-span-1"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <motion.input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 bg-white dark:bg-gray-800/60 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
              />
            </motion.div>
            <motion.div
              className="md:col-span-1"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <motion.input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                readOnly
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-100 dark:bg-gray-700"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
              />
              <motion.p 
                className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                We&apos;ll send you a verification code to your email
              </motion.p>
            </motion.div>
            <motion.div
              className="md:col-span-1"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Number
              </label>
              <motion.input
                id="mobile"
                name="mobile"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                pattern="[0-9]{10}"
                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
              />
              <motion.p 
                className="mt-1 text-xs text-gray-500"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                We&apos;ll use this for important account notifications
              </motion.p>
            </motion.div>
            <motion.div
              className="col-span-1"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-gray-500">
                  <span className="text-lg leading-none select-none" aria-hidden={formData.gender === ''} aria-label={formData.gender || 'gender'}>
                    {formData.gender === 'male' && '👱‍♂️'}
                    {formData.gender === 'female' && '👱‍♀️'}
                    {formData.gender === 'other' && '⚧️'}
                    {formData.gender === '' && '⚧️'}
                  </span>
                </div>
                <motion.select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800/60"
                  required
                  whileFocus={{ scale: 1.01, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">👱‍♂️ Male</option>
                  <option value="female">👱‍♀️ Female</option>
                  <option value="other">⚧️ Other</option>
                </motion.select>
              </div>
            </motion.div>
            <motion.div
              className="md:col-span-1"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State/Union Territory
              </label>
              <motion.select
                id="state"
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800/60"
                required
                whileFocus={{ scale: 1.01, boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}
              >
                <option value="">Select State/UT</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </motion.select>
              <motion.p 
                className="mt-1 text-xs text-gray-500"
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Select your state or union territory
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending verification email...
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Send Verification Email
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

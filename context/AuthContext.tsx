
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { api, ApiError } from '@/lib/api';

type CustomUser = { id: string; email: string; name?: string; mobile?: string | null; gender?: string | null; state?: string | null; role?: 'admin' | 'user'; two_factor_enabled?: boolean } | null;

type AuthContextType = {
  session: CustomUser;
  loading: boolean;
  supabase: typeof supabase;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: any;
    data: any;
  }>;
  signIn: (email: string, password: string, otp?: string) => Promise<{
    error: any;
    data: any;
  }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: { name?: string; mobile?: string; gender?: string; state?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  verifyOtp: (email: string, otp: string) => Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Same host as the Next app so /admin server layout can forward `custom_token` to Express. */
function syncCustomTokenCookie(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const maxAge = 60 * 60 * 24;
    if (token) {
      document.cookie = `custom_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      document.cookie = 'custom_token=; path=/; max-age=0';
    }
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await api.getCurrentUser();
        setSession(data.user);
        try {
          if (data.user) localStorage.setItem('custom_user', JSON.stringify(data.user));
          else localStorage.removeItem('custom_user');
        } catch {}
        try {
          const t = localStorage.getItem('custom_token');
          if (t) syncCustomTokenCookie(t);
        } catch {}
      } catch {
        // Fallback to localStorage (may lack `role` until next successful /api/auth/me)
        try {
          const raw = localStorage.getItem('custom_user');
          if (raw) {
            const parsed = JSON.parse(raw) as CustomUser;
            setSession(parsed);
          }
          const t = localStorage.getItem('custom_token');
          if (t) syncCustomTokenCookie(t);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    // Optional: Keep for compatibility or refactor to custom signup later
    return { data: null, error: null };
  };

  const signIn = async (email: string, password: string, otp?: string) => {
    try {
      const result = await api.login({ email, password, otp });
      // If server indicates OTP step is required, do not set session yet
      if (result && typeof result === 'object' && 'requiresOtp' in result) {
        return { data: result, error: null };
      }
      if (result && typeof result === 'object' && 'user' in result) {
        const user = result.user as CustomUser;
        const token = typeof (result as any).token === 'string' ? (result as any).token : null;
        try { localStorage.setItem('custom_user', JSON.stringify(user)); } catch {}
        try {
          if (token) localStorage.setItem('custom_token', token);
        } catch {}
        if (token) syncCustomTokenCookie(token);
        setSession(user);
      }
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Invalid credentials' };
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      // Still clear client state if backend is unreachable
    } finally {
      try {
        localStorage.removeItem('custom_user');
      } catch {}
      try {
        localStorage.removeItem('custom_token');
      } catch {}
      syncCustomTokenCookie(null);
      try {
        await supabase.auth.signOut();
      } catch {}
      setSession(null);
    }
  };

  const refreshSession = async () => {
    try {
      const data = await api.getCurrentUser();
      setSession(data.user);
      try {
        if (data.user) localStorage.setItem('custom_user', JSON.stringify(data.user));
        else localStorage.removeItem('custom_user');
      } catch {}
      try {
        const t = localStorage.getItem('custom_token');
        if (t) syncCustomTokenCookie(t);
      } catch {}
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const result = await api.verifyLoginOtp(email, otp);
      if (result && typeof result === 'object' && 'user' in result) {
        const user = result.user as CustomUser;
        const token = (result as any).token as string;
        try { localStorage.setItem('custom_user', JSON.stringify(user)); } catch {}
        try {
          if (token) localStorage.setItem('custom_token', token);
        } catch {}
        if (token) syncCustomTokenCookie(token);
        setSession(user);
        return { success: true, data: result };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Verification failed' };
    }
  };

  const updateProfile = async (data: { name?: string; mobile?: string; gender?: string; state?: string }) => {
    try {
      let token = '';
      try {
        token = localStorage.getItem('custom_token') || '';
      } catch {}

      if (!token) {
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const result = await api.updateProfile(data, token || undefined);

      if (!result?.success) {
        return { success: false, error: result?.error || result?.message || 'Failed to update profile' };
      }
      
      // Update local session with new data
      if (result.user) {
        const updatedUser = { ...session, ...result.user };
        setSession(updatedUser);
        try { localStorage.setItem('custom_user', JSON.stringify(updatedUser)); } catch {}
      }
      
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        try { localStorage.removeItem('custom_token'); } catch {}
        return { success: false, error: 'Session expired. Please login again.' };
      }
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred while updating profile' };
    }
  };

  const value = {
    session,
    loading,
    supabase,
    signUp,
    signIn,
    signOut,
    refreshSession,
    updateProfile,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

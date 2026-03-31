function requireApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!v) {
    throw new Error('NEXT_PUBLIC_API_URL is required in .env.local');
  }
  return v.replace(/\/$/, '');
}

const API_BASE_URL = requireApiBaseUrl();

export class ApiError extends Error {
  status: number;
  statusText: string;
  endpoint: string;
  data: unknown;

  constructor(message: string, status: number, statusText: string, endpoint: string, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.endpoint = endpoint;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const optHeaders =
      options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)
        ? (options.headers as Record<string, string>)
        : {};
    const { headers: _, ...restOptions } = options;
    const defaultHeaders: Record<string, string> = {};
    if (!(restOptions.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      ...restOptions,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...optHeaders,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText,
          endpoint,
          errorData
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json().catch(() => ({} as T));
    } catch (error) {
      // Avoid noisy console logs for expected HTTP errors handled by callers.
      if (!(error instanceof ApiError)) {
        console.error('API Request failed:', error);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// API functions
export const api = {
  // Test connection
  testConnection: () => apiClient.get<{message: string}>('/api/test'),
  
  // Home endpoint
  getHome: () => apiClient.get<{message: string}>('/'),
  
  // Authentication (FastAPI: /api/auth/password-login)
  login: async (credentials: { email: string; password: string; otp?: string }) => {
    try {
      return await apiClient.post('/api/auth/password-login', credentials);
    } catch (error) {
      // Compatibility fallback for Express backend route naming.
      if (error instanceof ApiError && error.status === 404) {
        return apiClient.post('/api/auth/login', credentials);
      }
      throw error;
    }
  },
    
  signup: (userData: { 
    email: string; 
    password: string; 
    name: string; 
    mobile: string; 
    gender: string; 
    state: string; 
    otp: string 
  }) => apiClient.post('/api/auth/signup', userData),
    
  getCurrentUser: async () => {
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        try {
          token = localStorage.getItem('custom_token') || '';
        } catch {}
      }
      // Browser: same-origin proxy (`app/api/auth/me`) so cookies work and Edge/middleware match behavior
      const meUrl =
        typeof window !== 'undefined'
          ? '/api/auth/me'
          : `${requireApiBaseUrl()}/api/auth/me`;
      const res = await fetch(meUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          return { user: null };
        }
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          (errorData as { detail?: string; message?: string }).detail ||
            (errorData as { message?: string }).message ||
            `API Error: ${res.status} ${res.statusText}`,
          res.status,
          res.statusText,
          '/api/auth/me',
          errorData
        );
      }
      const json = (await res.json()) as { user: any };
      if (json.user && typeof json.user === 'object') {
        json.user = {
          ...json.user,
          role: json.user.role === 'admin' ? 'admin' : 'user',
        };
      }
      return json;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        return { user: null };
      }
      throw error;
    }
  },

  logout: () => apiClient.post<{ message: string; ok: boolean }>('/api/auth/logout'),

  updateProfile: (
    data: { name?: string; mobile?: string | null; gender?: string | null; state?: string | null },
    token?: string
  ) =>
    apiClient.put<{ success: boolean; message?: string; user?: any; error?: string }>(
      '/api/auth/update-profile',
      data,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}
    ),

  changePassword: (
    data: { currentPassword?: string; newPassword?: string },
    token?: string
  ) =>
    apiClient.post<{ success: boolean; message?: string; error?: string }>(
      '/api/auth/change-password',
      data,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}
    ),

  // Website Identity
  getWebsiteInfo: () =>
    apiClient.get<{ success: boolean; websiteInfo: { name: string; logoUrl: string } }>(
      '/api/website-info'
    ),

  updateWebsiteInfo: (
    data: { name?: string; logoUrl?: string },
    token?: string
  ) =>
    apiClient.put<{ success: boolean; websiteInfo: any }>(
      '/api/admin/website-info',
      data,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}
    ),

  uploadWebsiteLogo: (file: File, token?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.request<{ success: boolean; logoUrl: string }>(
      '/api/admin/website-info/upload-logo',
      {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  },

  // OTP — for existing users doing passwordless login
  sendOtp: (data: { email: string; name?: string; purpose?: string; mobile?: string }) =>
    apiClient.post('/api/otp/send-otp', data),

  // Signup flow: send verification OTP to a new (not yet registered) email
  sendSignupVerification: (email: string) =>
    apiClient.post<{ success: boolean; message: string; otp?: string }>(
      '/api/auth/send-verification',
      { email }
    ),

  // Signup flow: verify email OTP (development accepts any 6-digit)
  verifyEmail: (email: string, otp: string) =>
    apiClient.post<{ success: boolean; verified?: boolean; message: string }>(
      '/api/auth/verify-email',
      { email, otp }
    ),

  // Signup flow: complete account creation after OTP verified
  completeSignup: (data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
    gender: string;
    state: string;
  }) =>
    apiClient.post<{ success: boolean; message: string; user?: any }>(
      '/api/auth/signup',
      data
    ),

  /** Email must exist in DB; purpose e.g. "login" for passwordless login */
  verifyLoginOtp: (email: string, otp: string) =>
    apiClient.post<{ message: string; user: any }>('/api/auth/verify-login-otp', {
      email,
      otp,
    }),
};

export default api;

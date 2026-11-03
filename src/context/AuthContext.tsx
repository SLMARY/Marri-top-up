import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CustomerProfile,
  CustomerRegistrationPayload,
  CustomerLoginPayload,
  CustomerProfileUpdatePayload,
} from '../types';

const TOKEN_STORAGE_KEY = 'uchiha_customer_token';
const CUSTOMER_STORAGE_KEY = 'uchiha_customer_profile';

interface AuthContextType {
  customer: CustomerProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: CustomerLoginPayload) => Promise<{ success: boolean; error?: string }>;
  register: (payload: CustomerRegistrationPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: CustomerProfileUpdatePayload) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getSavedToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSavedCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY) || sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

function persistAuthSession(token: string, customer: CustomerProfile, rememberMe = true) {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getSavedToken());
  const [customer, setCustomer] = useState<CustomerProfile | null>(() => getSavedCustomer());
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(getSavedToken()));

  const refreshProfile = useCallback(async () => {
    const activeToken = getSavedToken();
    if (!activeToken) {
      setCustomer(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/customer/profile', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: 'application/json',
        },
      });
      if (res.status === 401 || res.status === 403) {
        clearAuthSession();
        setCustomer(null);
        setToken(null);
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.success && data.customer && typeof data.customer === 'object') {
        setCustomer(data.customer);
        setToken(activeToken);
        const isRemembered = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
        persistAuthSession(activeToken, data.customer, isRemembered);
      }
    } catch (err) {
      console.warn('[Auth] Unable to refresh profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (payload: CustomerLoginPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.token || !data.customer) {
        return {
          success: false,
          error: data?.error || 'Login failed. Please check your email and password.',
        };
      }
      const remember = payload.rememberMe !== false;
      persistAuthSession(data.token, data.customer, remember);
      setToken(data.token);
      setCustomer(data.customer);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred during login.' };
    }
  };

  const register = async (payload: CustomerRegistrationPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.token || !data.customer) {
        return {
          success: false,
          error: data?.error || 'Registration failed. Please check your details and try again.',
        };
      }
      persistAuthSession(data.token, data.customer, true);
      setToken(data.token);
      setCustomer(data.customer);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred during registration.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }
    } finally {
      clearAuthSession();
      setToken(null);
      setCustomer(null);
    }
  };

  const updateProfile = async (
    payload: CustomerProfileUpdatePayload
  ): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'You must be logged in to update your profile.' };
    }
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Failed to update profile.' };
      }
      const isRemembered = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
      persistAuthSession(token, data.customer, isRemembered);
      setCustomer(data.customer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred while updating profile.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

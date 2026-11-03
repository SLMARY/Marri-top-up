import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CustomerProfile,
  CustomerRegistrationPayload,
  CustomerLoginPayload,
  CustomerProfileUpdatePayload,
} from '../types';
import { extractErrorMessage } from '../utils/errorUtils';

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

function normalizeCustomerProfile(raw: unknown): CustomerProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || typeof obj.email !== 'string') {
    return null;
  }
  return {
    id: String(obj.id),
    fullName: typeof obj.fullName === 'string' && obj.fullName.trim() ? obj.fullName.trim() : 'Customer',
    email: String(obj.email).trim().toLowerCase(),
    whatsappNumber: typeof obj.whatsappNumber === 'string' ? obj.whatsappNumber : '',
    billingAddress: typeof obj.billingAddress === 'string' ? obj.billingAddress : '',
    city: typeof obj.city === 'string' ? obj.city : '',
    country: typeof obj.country === 'string' && obj.country.trim() ? obj.country : 'Sri Lanka',
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt:
      typeof obj.updatedAt === 'string'
        ? obj.updatedAt
        : typeof obj.createdAt === 'string'
        ? obj.createdAt
        : new Date().toISOString(),
  };
}

function getSavedToken(): string | null {
  try {
    const val = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
    return typeof val === 'string' && val.trim() ? val.trim() : null;
  } catch {
    return null;
  }
}

function getSavedCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY) || sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeCustomerProfile(parsed);
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
      const validCustomer = normalizeCustomerProfile(data?.customer);
      if (data?.success && validCustomer) {
        setCustomer(validCustomer);
        setToken(activeToken);
        const isRemembered = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
        persistAuthSession(activeToken, validCustomer, isRemembered);
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
      const validCustomer = normalizeCustomerProfile(data?.customer);
      if (!res.ok || !data?.success || typeof data.token !== 'string' || !validCustomer) {
        return {
          success: false,
          error: extractErrorMessage(
            data?.error ?? data,
            'Login failed. Please check your email and password.'
          ),
        };
      }
      const remember = payload.rememberMe !== false;
      persistAuthSession(data.token, validCustomer, remember);
      setToken(data.token);
      setCustomer(validCustomer);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Network error occurred during login. Please try again.'),
      };
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
      const validCustomer = normalizeCustomerProfile(data?.customer);
      if (!res.ok || !data?.success || typeof data.token !== 'string' || !validCustomer) {
        return {
          success: false,
          error: extractErrorMessage(
            data?.error ?? data,
            'Registration failed. Please check your details and try again.'
          ),
        };
      }
      persistAuthSession(data.token, validCustomer, true);
      setToken(data.token);
      setCustomer(validCustomer);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Network error occurred during registration. Please try again.'),
      };
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
      const validCustomer = normalizeCustomerProfile(data?.customer);
      if (!res.ok || !data?.success || !validCustomer) {
        return {
          success: false,
          error: extractErrorMessage(data?.error ?? data, 'Failed to update profile.'),
        };
      }
      const isRemembered = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
      persistAuthSession(token, validCustomer, isRemembered);
      setCustomer(validCustomer);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Network error occurred while updating profile.'),
      };
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

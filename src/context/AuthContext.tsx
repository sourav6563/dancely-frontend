'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { User, LoginCredentials, RegisterData, ApiError } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutCleanup = () => {
    // removeQueries() prevents hydration issues (vs clear())
    queryClient.removeQueries();
    queryClient.setQueryData(['auth', 'me'], null);
    router.push('/');
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 500);
  };

  // Listen for auth-invalidated events when refresh token fails
  useEffect(() => {
    const handleAuthInvalidated = () => {
      queryClient.setQueryData(['auth', 'me'], null);
    };

    window.addEventListener('auth-invalidated', handleAuthInvalidated);
    return () => {
      window.removeEventListener('auth-invalidated', handleAuthInvalidated);
    };
  }, [queryClient]);

  const {
    data: userData,
    isLoading,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data || null;
    },
    retry: (failureCount, error: ApiError) => {
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Logged in successfully!');
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 400 && error.response?.data?.message === "You are already logged in") {
        toast.error("You are already logged in. Redirecting...");
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        router.push('/');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      setIsLoggingOut(true);
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      handleLogoutCleanup();
    },
    onError: () => {
      handleLogoutCleanup();
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response, variables) => {
      toast.success('Registration successful! Please verify your email.');
      router.push(`/verify-email?email=${variables.email}`);
    },
    onError: () => {
      toast.error('Registration failed');
    },
  });

  const value: AuthContextType = {
    user: userData || null,
    isAuthenticated: !!userData,
    isLoading: isLoading,
    isLoggingOut,
    login: async (credentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { User, LoginCredentials, RegisterData, ApiError } from '@/types';
import { toast } from 'sonner';

/**
 * Authentication Context
 * Manages user authentication state across the application
 * 
 * This context provides:
 * - Current user data
 * - Login/logout functions
 * - Authentication status
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Cleanup function for logout (used in both success and error cases)
  const handleLogoutCleanup = () => {
    queryClient.clear();
    router.push('/');
  };

  // Fetch current user if token exists
  const {
    data: userData,
    isLoading,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    retry: false, // Don't retry if it fails (means user is not authenticated)
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // Update the user data in cache
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Logged in successfully!');
      router.push('/');
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success('Logged out successfully');
      handleLogoutCleanup();
    },
    onError: () => {
      // Even if API fails, clear local state
      handleLogoutCleanup();
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response, variables) => {
      toast.success('Registration successful! Please verify your email.');
      // Redirect to verify email page with email in state
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

/**
 * Hook to use authentication context
 * Use this in any component that needs auth state or functions
 * 
 * Example:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

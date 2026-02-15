'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
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

  // Cleanup function for logout (used in both success and error cases)
  const handleLogoutCleanup = () => {
    // Clear all cached data first
    // Remove all cached queries instead of clearing the entire client context
    // This is safer for preventing hydration mismatches in strict browsers (like Brave)
    queryClient.removeQueries();
    // Then set user data to null immediately to prevent loading state
    // This ensures LandingPage with Login/Join buttons is shown right away
    queryClient.setQueryData(['auth', 'me'], null);
    
    // Force a hard navigation to the home page
    // This clears all JS state and ensures no ghost event listeners remain (Fixes Brave issue)
    window.location.href = '/';
    
    // Reset logout state after a delay to ensure transition is complete
    // and prevent ProtectedRoute from redirecting to login
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 2000);
  };

  // Listen for auth-invalidated events from the API client
  // This happens when refresh token fails, indicating stale auth state
  useEffect(() => {
    const handleAuthInvalidated = () => {
      // Clear all cached data to reset auth state
      // queryClient.clear(); // This triggers a refetch loop
      // Force a hard refresh to the home page
      // This ensures a clean state and fixes button interactivity issues in Brave
      // just like the manual logout does.
      window.location.href = '/';
    };

    window.addEventListener('auth-invalidated', handleAuthInvalidated);
    return () => {
      window.removeEventListener('auth-invalidated', handleAuthInvalidated);
    };
  }, [queryClient]);

  // Fetch current user if token exists
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
      // Don't retry on client errors (401, 403, 404), as these mean the user is genuinely not authenticated
      if (status && status >= 400 && status < 500) {
        return false;
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      // Update the user data in cache
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Logged in successfully!');
      // Navigation is now handled by the component calling login
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
    onMutate: () => {
      setIsLoggingOut(true);
    },
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

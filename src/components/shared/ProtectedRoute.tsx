'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function ProtectedRouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );
}

function ProtectedRouteContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      // Construct full URL with search params if they exist
      const queryString = searchParams.toString();
      const fullUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      // Encode the current path to handle special characters properly
      const returnUrl = encodeURIComponent(fullUrl);
      router.push(`/login?from=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, isLoggingOut, router, pathname, searchParams]);

  if (isLoading) {
    return <ProtectedRouteLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Wrapped in Suspense to handle useSearchParams usage
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ProtectedRouteLoader />}>
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </Suspense>
  );
}

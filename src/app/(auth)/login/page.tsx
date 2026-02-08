'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginValues } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Login Page Content
 * Contains the logic that uses useSearchParams
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form setup with zod validation
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const handleRedirect = useCallback(() => {
    const from = searchParams.get('from');
    let redirectUrl = '/';

    if (from) {
      try {
        const decoded = decodeURIComponent(from);
        // Ensure it's a relative path and not a protocol-relative url (//example.com)
        if (decoded.startsWith('/') && !decoded.startsWith('//')) {
           // Prevent redirect loops to login page
           if (!decoded.startsWith('/login')) {
             redirectUrl = decoded;
           }
        }
      } catch (e) {
        // Fallback to default redirect on decoding error
        console.error('Failed to decode redirect URL:', e);
      }
    }
    
    router.push(redirectUrl);
  }, [searchParams, router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handleRedirect();
    }
  }, [isAuthenticated, handleRedirect, router, searchParams]);

  const onSubmit = async (data: LoginValues) => {
    setIsSubmitting(true);
    try {
      await login(data);
      handleRedirect();
    } catch {
      // Error toast is already handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only disable form during active submission, not during background auth check
  // This prevents the page from getting stuck when there are stale tokens
  const isLoading = isSubmitting;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black p-4">
        <Card className="w-full max-w-md shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to Dancely
            </CardTitle>
            <CardDescription className="text-base dark:text-gray-400">
              Login to share your dance moves with the world
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email or Username */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="dancer@example.com"
                          disabled={isLoading}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                          tabIndex={-1}
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className="h-11 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline">
                Join now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}

/**
 * Login Page
 * 
 * Features:
 * - react-hook-form + zod validation
 * - Uses AuthContext for login state management
 * - Proper error handling with toast notifications
 * - Clean, modern UI following shadcn principles
 * - WRAPPED IN SUSPENSE for searchParams support
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

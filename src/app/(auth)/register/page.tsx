'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounceCallback } from 'usehooks-ts';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/types';
import { registerSchema, type RegisterValues } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Registration Page
 * 
 * Features:
 * - react-hook-form + zod validation
 * - Real-time username availability check with useDebounceCallback
 * - TanStack Query for API mutations
 * - Clean, modern UI following shadcn principles
 */
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Username availability state
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const debouncedSetUsername = useDebounceCallback(setUsername, 800);

  // Form setup with zod validation
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Check username availability when debounced value changes
  useEffect(() => {
    const checkUsername = async () => {
      // Only check if username meets basic formatting requirements
      if (username && username.length >= 3 && /^[a-z0-9_]+$/.test(username)) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await authApi.checkUsername(username);
          if (response.data?.available) {
            setUsernameMessage('Username is available');
          } else {
            setUsernameMessage('Username is already taken');
          }
        } catch {
          setUsernameMessage('Error checking username');
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        // Clear message if username is invalid/empty so we don't show "Available" 
        // while the form shows invalid format errors
        setUsernameMessage('');
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [username]);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created! Please verify your email.');
      router.push(`/verify-email?email=${encodeURIComponent(form.getValues('email'))}`);
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: RegisterValues) => {
    // Prevent submission if username is taken
    if (usernameMessage === 'Username is already taken') {
      toast.error('Username is already taken');
      return;
    }

    registerMutation.mutate({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    });
  };

  const isSubmitting = registerMutation.isPending;
  const isUsernameAvailable = usernameMessage === 'Username is available';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black p-4">
        <Card className="w-full max-w-md shadow-xl dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Join Dancely
          </CardTitle>
            <CardDescription className="text-base dark:text-gray-400">
            Create your account and start sharing your dance journey
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={isSubmitting}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username with real-time availability check */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="johndancer"
                          disabled={isSubmitting}
                          className={`h-11 pr-10 ${
                            !usernameMessage ? '' :
                            isUsernameAvailable 
                              ? 'border-green-500 focus-visible:ring-green-500' 
                              : 'border-red-500 focus-visible:ring-red-500'
                          }`}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase();
                            field.onChange(value);
                            debouncedSetUsername(value);
                          }}
                        />
                        {/* Username status indicator */}
                        {username.length >= 3 && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isCheckingUsername ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : isUsernameAvailable ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : usernameMessage ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {/* Username availability message */}
                    {/* Username availability message - Reserved space to prevent layout shift */}
                    {usernameMessage && (
                      <p className={`text-sm transition-colors ${
                        isUsernameAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {usernameMessage}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="dancer@example.com"
                        disabled={isSubmitting}
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          disabled={isSubmitting}
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

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className="h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        >
                          {showConfirmPassword ? (
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
                disabled={isSubmitting || (usernameMessage !== '' && !isUsernameAvailable)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}

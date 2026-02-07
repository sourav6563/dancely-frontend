'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { ApiError } from '@/types';

/**
 * Forgot Password Page
 * Clean implementation with react-hook-form + zod validation
 */
export default function ForgotPasswordPage() {
  const [codeSent, setCodeSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSentEmail(form.getValues('email'));
      setCodeSent(true);
      toast.success('Reset code sent to your email!');
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code';
      const status = error.response?.status;

      if (status === 404 || errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('not registered')) {
        // UX Best Practice: Use inline form errors for input-specific issues
        form.setError('email', {
          type: 'manual',
          message: 'No account found with this email address.',
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    forgotPasswordMutation.mutate(data);
  };

  // Success state - code has been sent
  if (codeSent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black p-4">
          <Card className="w-full max-w-md shadow-xl text-center dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base dark:text-gray-400">
                We&apos;ve sent a password reset code to <strong>{sentEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-3">
              <Link href={`/reset-password?email=${encodeURIComponent(sentEmail)}`} className="w-full">
                <Button className="w-full h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Enter Reset Code
                </Button>
              </Link>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the email?{' '}
                <button
                  onClick={() => setCodeSent(false)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline"
                >
                  Try again
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black p-4">
        <Card className="w-full max-w-md shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-base dark:text-gray-400">
              No worries! Enter your email and we&apos;ll send you a reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          disabled={forgotPasswordMutation.isPending}
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* Helper for Not Found Error */}
                      {form.formState.errors.email?.message === 'No account found with this email address.' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Don&apos;t have an account?{' '}
                          <Link href="/register" className="text-purple-600 hover:underline font-medium">
                            Join now
                          </Link>
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold mt-6"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
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

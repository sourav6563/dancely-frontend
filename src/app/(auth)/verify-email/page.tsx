'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { verifyEmailSchema, type VerifyEmailValues } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Email Verification Page Content
 * Clean implementation with react-hook-form + zod validation
 */
function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onChange",
    defaultValues: {
      email: emailFromQuery,
      code: '',
    },
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setIsVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => router.push('/login'), 2000);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Verification failed');
    },
  });

  const onSubmit = (data: VerifyEmailValues) => {
    verifyMutation.mutate(data);
  };

  // Success state
  if (isVerified) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black p-4">
          <Card className="w-full max-w-md shadow-xl text-center dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                Email Verified!
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Your account has been successfully verified. Redirecting to login...
              </CardDescription>
            </CardHeader>
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
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-base dark:text-gray-400">
              Enter the verification code sent to your email
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
                      {emailFromQuery ? (
                        <div className="text-center mb-4">
                          <p className="text-gray-600 dark:text-gray-400">
                            Verifying for <span className="font-semibold text-gray-900 dark:text-white">{emailFromQuery}</span>
                          </p>
                          <input type="hidden" {...field} />
                        </div>
                      ) : (
                        <>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="dancer@example.com"
                              disabled={verifyMutation.isPending}
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          disabled={verifyMutation.isPending}
                          className="h-11 text-center text-lg md:text-2xl tracking-widest placeholder:tracking-normal"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                
                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold mt-6"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already verified?{' '}
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

/**
 * Wrapped component with Suspense boundary for useSearchParams
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
          <Card className="w-full max-w-md shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-8">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

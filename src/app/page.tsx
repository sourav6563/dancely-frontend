'use client';

import { Navbar } from '@/components/layout/Navbar';
import { VideoFeed } from '@/components/home/VideoFeed';
import { LandingPage } from '@/components/home/LandingPage';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Optionally show a loading spinner while auth state checks, 
  // but usually Navbar + Landing Page is fine for initial flash if needed.
  // We'll rely on useAuth's initial state.

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen dark:bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {isAuthenticated ? <VideoFeed /> : <LandingPage />}
      </main>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, User, Settings, LogOut, Home, Heart, History, Folder, Search, Video, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Main Navigation Bar Component
 * Shows different UI based on authentication status
 */
export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutDialog(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-black/80 border-gray-200 dark:border-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dancely
            </span>
          </Link>

          {/* Search Bar - Center (Only for authenticated users and not on search page) */}
          {isAuthenticated && pathname !== '/search' && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search videos, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-12 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500 dark:text-white dark:placeholder-gray-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Navigation Links & User Menu */}
          {isLoading ? (
             <div className="flex items-center space-x-4">
               <Skeleton className="h-9 w-20 rounded-md" />
               <Skeleton className="h-9 w-20 rounded-md" />
               <Skeleton className="h-10 w-10 rounded-full" />
             </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-6">
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-2">
                <Link
                  href="/"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-medium"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/community"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-medium"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Community</span>
                </Link>
                <Link
                  href="/upload"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-medium"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
              </nav>

              {/* Mobile Search Toggle (Authenticated - Hidden on Search Page) */}
              {isAuthenticated && pathname !== '/search' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-700 dark:text-gray-200 mr-4"
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Theme Toggle */}
              <div className="mr-4">
                <ThemeToggle />
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 p-0">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-purple-100 dark:ring-purple-900/30">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => router.push('/upload')}
                    className="cursor-pointer md:hidden focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/community')}
                    className="cursor-pointer md:hidden focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Community</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem 
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    <span>Videos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/playlists')}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Playlists</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/liked')}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Liked</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/history')}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <History className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/settings')}
                    className="cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-purple-700 dark:focus:text-purple-300"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowLogoutDialog(true);
                    }}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Mobile Search Toggle (Hidden on Search Page) */}
              {/* Removed for unauthenticated users as per requirement */}

              {/* Theme Toggle */}
              <ThemeToggle />
              
              <Link href="/login">
                <Button variant="ghost" className="font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/20">
                  Join
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Search Input */}
        {showMobileSearch && (
          <div className="md:hidden py-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search videos, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="pl-4 pr-12 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500 dark:text-white dark:placeholder-gray-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              onClick={handleLogout}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}

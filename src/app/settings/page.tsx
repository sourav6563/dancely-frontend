'use client';

import { useState, useEffect } from 'react';

import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api/users';
import { authApi } from '@/lib/api/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { AxiosError } from 'axios';

import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  

  
  // Profile Image State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Personal Info State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');

  // Sync state with user data when it becomes available
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      setName(user.name || '');
      setBio(user.bio || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 1. Update Profile Image
  const updateImageMutation = useMutation({
    mutationFn: userApi.updateProfileImage,
    onSuccess: () => {
      toast.success('Profile image updated successfully');
      setSelectedImage(null);
      setImagePreview(null);
      // Ideally we should update the user context here. 
      // A quick reload is a simple way to sync, or we can expose a setUser method in context.
      window.location.reload(); 
    },
    onError: () => {
      toast.error('Failed to update profile image');
    },
  });

  // Get max image size from ENV (default 5MB)
  const MAX_IMAGE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_SIZE_MB) || 5;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid format. Only JPEG and PNG are allowed.');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`Image must be less than ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateImage = () => {
    if (selectedImage) {
      updateImageMutation.mutate(selectedImage);
    }
  };

  // 2. Update Name
  const updateNameMutation = useMutation({
    mutationFn: userApi.updateName,
    onSuccess: () => {
      toast.success('Name updated successfully');
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to update name');
    },
  });

  // 2.5 Update Bio
  const updateBioMutation = useMutation({
    mutationFn: userApi.updateBio,
    onSuccess: () => {
      toast.success('Bio updated successfully');
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to update bio');
    },
  });

  // 3. Update Email
  const updateEmailMutation = useMutation({
    mutationFn: userApi.updateEmail,
    onSuccess: () => {
      toast.success('Email updated successfully');
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to update email');
    },
  });

  // 4. Change Password
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: unknown) => {
      toast.error((error as AxiosError<{ message: string }>).response?.data?.message || 'Failed to change password');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  // Show skeleton while loading
  if (isLoading || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header Skeleton */}
            <Skeleton className="h-10 w-48 mb-8 mt-8" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-4">
                {/* Tabs List Skeleton */}
                <div className="flex space-x-6 border-b mb-6">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>

                {/* Content Skeleton - Mimicking Profile Tab */}
                <div className="space-y-6">
                  {/* Profile Image Skeleton */}
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="flex items-center gap-6">
                         <Skeleton className="h-24 w-24 rounded-full" />
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-4 w-48" />
                         </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Personal Info Skeleton */}
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Settings
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar / Tabs List could go here, but using horizontal tabs for simplicity */}
            <div className="lg:col-span-4">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                  <TabsTrigger 
                    value="profile"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-500 rounded-none px-0 py-2 dark:text-gray-400 dark:data-[state=active]:text-white"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-500 rounded-none px-0 py-2 dark:text-gray-400 dark:data-[state=active]:text-white"
                  >
                    Account
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-500 rounded-none px-0 py-2 dark:text-gray-400 dark:data-[state=active]:text-white"
                  >
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  {/* Profile Image Card */}
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                      <CardDescription>Update your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 ring-4 ring-purple-100">
                          <AvatarImage src={imagePreview || user?.profileImage} />
                          <AvatarFallback className="text-2xl">
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Label htmlFor="picture" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              <Upload className="h-4 w-4" />
                              Upload new image
                            </div>
                            <Input
                              id="picture"
                              type="file"
                              accept="image/jpeg,image/png"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </Label>
                          <p className="text-xs text-gray-500">
                            JPG,PNG. Max size of {MAX_IMAGE_SIZE_MB}MB.
                          </p>
                        </div>
                      </div>
                      {selectedImage && (
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleUpdateImage}
                            disabled={updateImageMutation.isPending}
                            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            {updateImageMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save New Picture
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Name Card */}
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm"
                        />
                      </div>
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => updateNameMutation.mutate(name)}
                          disabled={updateNameMutation.isPending || name === user?.name}
                          className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {updateNameMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Name
                        </Button>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          maxLength={160}
                          className="min-h-30 bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm"
                          placeholder="Tell us about yourself..."
                        />
                        <div className="text-xs text-gray-500 text-right">
                          {bio.length}/160 characters
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => updateBioMutation.mutate(bio)}
                          disabled={updateBioMutation.isPending || bio === (user?.bio || '')}
                          className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {updateBioMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Bio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account">
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => updateEmailMutation.mutate(email)}
                          disabled={updateEmailMutation.isPending || email === user?.email}
                          className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          {updateEmailMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card className="dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>Change your password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input 
                            id="current-password" 
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className="bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input 
                            id="new-password" 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className={`bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm ${
                              newPassword && newPassword.length < 6 ? 'border-red-500 focus-visible:ring-red-500 mb-1' : ''
                            }`}
                          />
                          {newPassword && newPassword.length < 6 && (
                            <p className="text-xs text-red-500 font-medium">Password must be at least 6 characters</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input 
                            id="confirm-password" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`bg-white dark:bg-gray-800 dark:border-gray-700 max-w-sm ${
                              confirmPassword && newPassword !== confirmPassword ? 'border-red-500 focus-visible:ring-red-500 mb-1' : ''
                            }`}
                          />
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                          )}
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="submit"
                            disabled={
                              changePasswordMutation.isPending || 
                              !oldPassword || 
                              !newPassword || 
                              !confirmPassword ||
                              newPassword.length < 6 ||
                              newPassword !== confirmPassword
                            }
                            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {changePasswordMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Change Password
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

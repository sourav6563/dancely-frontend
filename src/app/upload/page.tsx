'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/videos';
import type { ApiError } from '@/types';
import { toast } from 'sonner';
import { Upload as UploadIcon, Video, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { AxiosProgressEvent } from 'axios';

/**
 * Video Upload Page
 * Allows users to upload videos with title, description, and thumbnail
 */
export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      abortControllerRef.current = new AbortController();
      const response = await videoApi.upload(
        formData,
        (progressEvent: AxiosProgressEvent) => {
          const videoEntry = formData.getAll('video')[0];
          const totalSize = progressEvent.total || (videoEntry instanceof File ? videoEntry.size : 0);
          
          if (totalSize > 0) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / totalSize);
            setUploadProgress(percentCompleted);
          }
        },
        abortControllerRef.current.signal
      );
      return response.data;
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      toast.success('Video uploaded successfully!');
      setTimeout(() => {
        router.push(`/watch/${data._id}`);
      }, 2000);
    },
    onError: (error: ApiError) => {
      if (error.code === 'ERR_CANCELED') {
         toast.info('Upload cancelled');
      } else {
         toast.error(error.response?.data?.message || 'Upload failed');
      }
      setUploadProgress(0);
      abortControllerRef.current = null;
    },
  });

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Get max size from ENV (default 100MB for video, 5MB for thumbnail)
  const MAX_VIDEO_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB) || 100;
  const MAX_THUMBNAIL_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_THUMBNAIL_SIZE_MB) || 5;

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid format. Only MP4 is allowed.');
        return;
      }
      // Validate file size
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video file must be less than ${MAX_VIDEO_SIZE_MB}MB`);
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid format. Only JPEG and PNG are allowed.');
        return;
      }
      // Validate file size
      if (file.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024) {
        toast.error(`Thumbnail must be less than ${MAX_THUMBNAIL_SIZE_MB}MB`);
        return;
      }
      setThumbnail(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, type: 'video' | 'thumbnail') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'video') {
         const validTypes = ['video/mp4'];
        if (!validTypes.includes(file.type)) {
           toast.error('Invalid video format. Only MP4 is allowed.');
           return;
        }
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          toast.error(`Video file must be less than ${MAX_VIDEO_SIZE_MB}MB`);
          return;
        }
        setVideoFile(file);
      } else if (type === 'thumbnail') {
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
           toast.error('Invalid image format. Only JPEG and PNG are allowed.');
           return;
        }
        if (file.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024) {
          toast.error(`Thumbnail must be less than ${MAX_THUMBNAIL_SIZE_MB}MB`);
          return;
        }
        setThumbnail(file);
      }
    }
  }, [MAX_VIDEO_SIZE_MB, MAX_THUMBNAIL_SIZE_MB]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters');
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!thumbnail) {
      toast.error('Please select a thumbnail image');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnail);

    setUploadProgress(0);
    uploadMutation.mutate(formData);
  };

  if (isSuccess) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl text-center dark:bg-gray-900 dark:border-gray-800">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Upload Successful!
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Your video has been uploaded. Redirecting to watch page...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-xl dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Upload Your Dance Video
              </CardTitle>
              <CardDescription className="text-sm dark:text-gray-400">
                Share your amazing dance moves with the world!
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Video Upload */}
                <div className="space-y-1.5">
                  <Label htmlFor="video" className="text-sm font-semibold">
                    Video File <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onDrop={(e) => handleDrop(e, 'video')}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      videoFile
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:border-purple-500 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    {videoFile ? (
                      <div className="space-y-2">
                        <Video className="mx-auto h-10 w-10 text-green-600" />
                        <p className="font-medium text-green-700">{videoFile.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setVideoFile(null)}
                        >
                          Change Video
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="font-medium text-sm">Drop your video here, or click to browse</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Max file size: {MAX_VIDEO_SIZE_MB}MB. Allowed Format: MP4
                        </p>
                      </div>
                    )}
                    <Input
                      id="video"
                      type="file"
                      accept="video/mp4"
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={uploadMutation.isPending}
                    />
                    {!videoFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('video')?.click()}
                        className="mt-3"
                        disabled={uploadMutation.isPending}
                        size="sm"
                      >
                        Select Video
                      </Button>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-1.5">
                  <Label htmlFor="thumbnail" className="text-sm font-semibold">
                    Thumbnail Image <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onDrop={(e) => handleDrop(e, 'thumbnail')}
                    onDragOver={handleDragOver}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      thumbnail
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:border-purple-500 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    {thumbnail ? (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-10 w-10 text-green-600" />
                        <p className="font-medium text-green-700">{thumbnail.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {(thumbnail.size / 1024).toFixed(2)} KB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setThumbnail(null)}
                        >
                          Change Thumbnail
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="font-medium text-sm">Drop your thumbnail here, or click to browse</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           Max size: {MAX_THUMBNAIL_SIZE_MB}MB. Allowed Format: JPEG, PNG. Recommended: 1280x720
                        </p>
                      </div>
                    )}
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      disabled={uploadMutation.isPending}
                    />
                    {!thumbnail && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('thumbnail')?.click()}
                        className="mt-3"
                        disabled={uploadMutation.isPending}
                        size="sm"
                      >
                        Select Thumbnail
                      </Button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Give your video an amazing title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError('');
                    }}
                    disabled={uploadMutation.isPending}
                    className="h-10"
                    maxLength={100}
                    aria-invalid={!!titleError}
                  />
                  {titleError ? (
                    <p className="text-xs text-red-500 font-medium">{titleError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{title.length}/100</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell viewers about your dance..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploadMutation.isPending}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{description.length}/500</p>
                </div>

                {/* Upload Progress */}
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {uploadProgress === 100 ? 'Processing...' : 'Uploading...'}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    {uploadProgress === 100 && (
                      <p className="text-xs text-muted-foreground animate-pulse">
                        Finalizing your video. This may take a moment...
                      </p>
                    )}
                  </div>
                )}

                {/* Submit and Cancel Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="flex-1 h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload Video
                      </>
                    )}
                  </Button>
                  
                  {uploadMutation.isPending && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                        >
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Upload?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the upload? You will lose all progress.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelUpload}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Yes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

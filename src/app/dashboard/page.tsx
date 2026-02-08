'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { VideoCard } from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatViews } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useMyVideos, useDeleteVideo, useTogglePublishStatus } from '@/lib/hooks/useDashboard';
import { toast } from 'sonner';
import {
  Video,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Heart,
  Pencil,
  BarChart3,
  Users,
  PlaySquare,
  MoreVertical,
} from 'lucide-react';
import type { MyVideo, Video as VideoType } from '@/types';
import { EditVideoModal } from '@/components/video/EditVideoModal';
import { useDashboardStats } from '@/lib/hooks/useDashboard';


/**
 * Dashboard Page
 * Manage user's uploaded videos
 */
export default function DashboardPage() {
  const { data: videosData, isLoading: videosLoading } = useMyVideos();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const deleteVideo = useDeleteVideo();
  const togglePublish = useTogglePublishStatus();
  const [editingVideo, setEditingVideo] = useState<MyVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const handleDeleteClick = (videoId: string, title: string) => {
    setVideoToDelete({ id: videoId, title });
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    
    // Start deletion process
    const idToDelete = videoToDelete.id;
    
    // Close modal immediately and set local deleting state
    setVideoToDelete(null);
    setDeletingVideoId(idToDelete);

    const promise = deleteVideo.mutateAsync(idToDelete);

    toast.promise(promise, {
      loading: 'Deleting video...',
      success: 'Video deleted successfully',
      error: (err) => err?.response?.data?.message || 'Failed to delete video',
      finally: () => {
        // We generally don't need to unsetDeletingVideoId because the item will be removed from list
        // But if it fails, we should unset it to restore opacity
        setDeletingVideoId(null);
      }
    });
  };

  const handleTogglePublish = async (videoId: string) => {
    try {
      await togglePublish.mutateAsync(videoId);
      // Toast is already shown by the hook
    } catch {
      // Error toast is already shown by the hook
    }
  };



  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 w-fit">
                  My Videos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all your uploaded videos</p>
              </div>
              <Link href="/upload">
                <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {statsLoading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                   <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                     <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
                       <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                       <div className="space-y-1 sm:space-y-2">
                         <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                         <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
                       </div>
                     </CardContent>
                   </Card>
                 ))
              ) : (
                  <>
                    <Card className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-purple-100 text-purple-600 rounded-full dark:bg-purple-900/20 dark:text-purple-400">
                          <PlaySquare className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Videos</p>
                          <h3 className="text-lg sm:text-2xl font-bold">{stats?.totalVideos || 0}</h3>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                          <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Views</p>
                          <h3 className="text-lg sm:text-2xl font-bold">{formatViews(stats?.totalViews || 0)}</h3>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-pink-100 text-pink-600 rounded-full dark:bg-pink-900/20 dark:text-pink-400">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Followers</p>
                          <h3 className="text-lg sm:text-2xl font-bold">{stats?.totalFollowers || 0}</h3>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/20 dark:text-red-400">
                          <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground">Likes</p>
                          <h3 className="text-lg sm:text-2xl font-bold">{stats?.totalLikes || 0}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Recent Uploads
            </h2>

            {/* Loading State for Videos */}
            {videosLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Videos Grid */}
            {!videosLoading && videosData && videosData.docs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videosData.docs.map((video: MyVideo) => {
                  const isDeleting = deletingVideoId === video._id;
                  
                  return (
                    <div key={video._id} className={isDeleting ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
                      <VideoCard
                        video={video as unknown as VideoType}
                        hideOwner={true}
                        thumbnailOverlay={
                          <Badge
                            variant={video.isPublished ? 'default' : 'secondary'}
                            className={
                              video.isPublished
                                ? 'bg-green-500/90 hover:bg-green-600 text-xs py-0 h-5'
                                : 'bg-gray-500/90 hover:bg-gray-600 text-xs py-0 h-5'
                            }
                          >
                            {video.isPublished ? 'Public' : 'Private'}
                          </Badge>
                        }
                        afterTitleContent={
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 sm:h-8 sm:w-8 -mr-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 shrink-0"
                              >
                                 <MoreVertical className="h-4 w-4" />
                                 <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-gray-900 dark:border-gray-800">
                            <DropdownMenuItem onClick={() => setEditingVideo(video)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublish(video._id)}>
                              {video.isPublished ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    <span>Private</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Public</span>
                                  </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(video._id, video.title)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!videosLoading && videosData && videosData.docs.length === 0 && (
              <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                <Video className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No videos yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start sharing your amazing dance moves with the world!
                </p>
                <Link href="/upload">
                  <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your First Video
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
        
        {editingVideo && (
          <EditVideoModal
            video={editingVideo}
            isOpen={!!editingVideo}
            onClose={() => setEditingVideo(null)}
          />
        )}

        <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this video
                and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
              >
                {deleteVideo.isPending ? 'Deleting...' : 'Delete Video'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ProtectedRoute>
    </>
  );
}

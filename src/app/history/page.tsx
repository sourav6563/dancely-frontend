'use client';

import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { VideoCard } from '@/components/video/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/users';
import { likeApi } from '@/lib/api/likes';
import { useToggleVideoLike } from '@/lib/hooks/useVideos';
import { History as HistoryIcon } from 'lucide-react';
import type { Video } from '@/types';

/**
 * Watch History Page
 * Displays user's watch history
 */
export default function HistoryPage() {
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const response = await userApi.getWatchHistory();
      return response.data;
    },
  });

  const { data: likedVideos } = useQuery({
    queryKey: ['videos', 'liked'],
    queryFn: async () => {
      const response = await likeApi.getLikedVideos();
      return response.data;
    },
  });

  const likedVideoIds = new Set(likedVideos?.map((v: Video) => v._id));

  const toggleLike = useToggleVideoLike();

  const handleLike = (videoId: string) => {
    toggleLike.mutate(videoId);
  };

  const isLoading = isHistoryLoading;

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 w-fit">
                Watch History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Videos you&apos;ve watched recently</p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 dark:bg-gray-800" />
                    <Skeleton className="h-4 w-1/2 dark:bg-gray-800" />
                  </div>
                ))}
              </div>
            )}

            {/* Videos Grid */}
            {!isLoading && historyData && historyData.docs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {historyData.docs.map((video: Video) => {
                  const isLiked = likedVideoIds.has(video._id);
                  // Patch the video object with correct liked status from our local source of truth
                  const patchedVideo = {
                    ...video,
                    isLiked: isLiked,
                    likesCount: isLiked ? Math.max(video.likesCount || 0, 1) : (video.likesCount || 0)
                  };
                  
                  return (
                    <VideoCard
                      key={video._id}
                      video={patchedVideo}
                      onLike={handleLike}
                      isLiking={toggleLike.isPending}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && historyData && historyData.docs.length === 0 && (
              <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                <HistoryIcon className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No watch history yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start watching videos to see them here!
                </p>
              </Card>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}

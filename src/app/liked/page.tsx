'use client';

import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { VideoCard } from '@/components/video/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { likeApi } from '@/lib/api/likes';
import { useToggleVideoLike } from '@/lib/hooks/useVideos';
import { Heart } from 'lucide-react';
import type { Video } from '@/types';

/**
 * Liked Videos Page
 * Displays all videos liked by the current user
 */
export default function LikedVideosPage() {
  const { data: likedVideos, isLoading } = useQuery({
    queryKey: ['videos', 'liked'],
    queryFn: async () => {
      const response = await likeApi.getLikedVideos();
      return response.data;
    },
  });

  const toggleLike = useToggleVideoLike();

  const handleLike = (videoId: string) => {
    toggleLike.mutate(videoId);
  };

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 w-fit">
                Liked Videos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Videos you&apos;ve liked</p>
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
            {!isLoading && likedVideos && likedVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedVideos.map((video: Video) => (
                  <VideoCard
                    key={video._id}
                    video={{...video, isLiked: true}}
                    onLike={handleLike}
                    isLiking={toggleLike.isPending}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && likedVideos && likedVideos.length === 0 && (
              <Card className="p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                <Heart className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No liked videos yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Like videos to see them appear here!
                </p>
              </Card>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useVideos, useToggleVideoLike } from '@/lib/hooks/useVideos';
import { VideoCard } from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Clock, Eye } from 'lucide-react';

type SortOption = 'latest' | 'views' | 'trending';

export function VideoFeed() {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  
  // Map UI sort options to backend params
  const getSortParams = () => {
    switch (sortBy) {
      case 'views':
        return { sortBy: 'views' as const, sortOrder: 'desc' as const };
      case 'trending':
        return { sortBy: 'views' as const, sortOrder: 'desc' as const }; // Could be improved with a trending algorithm
      case 'latest':
      default:
        return { sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useVideos(getSortParams());

  const toggleLike = useToggleVideoLike();

  const handleLike = (videoId: string) => {
    toggleLike.mutate(videoId);
  };

  const sortOptions = [
    { id: 'latest' as const, label: 'Latest', icon: Clock },
    { id: 'views' as const, label: 'Popular', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:bg-none dark:bg-black">
      <div className="container mx-auto px-4 py-6">
        {/* Filter/Sort Options */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                  ${sortBy === option.id 
                    ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/50' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-purple-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-purple-500'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 text-lg">Failed to load videos. Please try again later.</p>
          </div>
        )}

        {/* Video Grid */}
        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {data.pages.map((page) =>
                page.docs.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    onLike={handleLike}
                    isLiking={toggleLike.isPending}
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 h-11"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Videos'
                  )}
                </Button>
              </div>
            )}

            {/* End Message */}
            {!hasNextPage && data.pages[0].docs.length > 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-12">
                You&apos;ve reached the end! 🎉
              </p>
            )}

            {/* No Videos Message */}
            {data.pages[0].docs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No videos found. Be the first to upload!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

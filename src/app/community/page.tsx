'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { CreatePostForm } from '@/components/community/CreatePostForm';
import { useAllCommunityPosts, useTogglePostLike } from '@/lib/hooks/useCommunity';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw, ArrowLeft } from 'lucide-react';

export default function CommunityPage() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data: posts, isLoading, refetch, isFetching } = useAllCommunityPosts({ page, limit: 10 });
  const toggleLike = useTogglePostLike();

  const handleLike = useCallback((postId: string) => {
    toggleLike.mutate(postId);
  }, [toggleLike]);

  const handlePostCreated = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Page Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Community</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">See what creators are sharing</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refetch()}
              disabled={isFetching}
              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

        {/* Create Post Form */}
        <CreatePostForm onPostCreated={handlePostCreated} />

        {/* Posts Feed */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          ) : posts && posts.docs.length > 0 ? (
            <>
              {posts.docs.map((post) => (
                <CommunityPostCard 
                  key={post._id} 
                  post={post} 
                  onLike={handleLike}
                />
              ))}

              {/* Pagination */}
              {posts.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm text-gray-500">
                    Page {page} of {posts.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!posts.hasNextPage || isFetching}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
              <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Be the first to share something with the community! Your post will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

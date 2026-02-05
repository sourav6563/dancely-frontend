import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeApi } from "@/lib/api/likes";
import { communityApi } from "@/lib/api/community";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { CommunityPostWithStats, PaginatedResponse, PaginationParams } from "@/types";

/**
 * Custom hook to toggle like on a community post with optimistic updates
 */
export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeApi.togglePostLike,
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["community-posts"] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueriesData<PaginatedResponse<CommunityPostWithStats>>({
        queryKey: ["community-posts"],
      });

      // Optimistically update all community-posts queries
      queryClient.setQueriesData<PaginatedResponse<CommunityPostWithStats>>(
        { queryKey: ["community-posts"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            docs: old.docs.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                  }
                : post,
            ),
          };
        },
      );

      return { previousPosts };
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback to previous value on error
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const errorMessage =
        (error as AxiosError<{ message: string }>)?.response?.data?.message ||
        "Failed to like post. Please try again.";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

/**
 * Custom hook to delete a community post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: communityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
}

/**
 * Custom hook to fetch all community posts (global feed)
 */
export function useAllCommunityPosts(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["community-posts", "feed", "v2", params],
    queryFn: async () => {
      const response = await communityApi.getAllPosts(params);
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "@/lib/api/videos";
import { commentApi } from "@/lib/api/comments";
import { likeApi } from "@/lib/api/likes";
import type { PaginationParams, CommentWithStats, ApiError } from "@/types";
import { toast } from "sonner";

/**
 * Custom hook to fetch a single video by ID with all stats
 */
export function useVideoById(videoId: string) {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const response = await videoApi.getById(videoId);
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Custom hook to fetch comments for a video
 */
export function useVideoComments(videoId: string, params: PaginationParams = {}) {
  // Use a stable key for the query by ensuring params defaults are handled consistently
  // However, since we invalidate by prefix ["comments", "video", videoId], it should catch all
  return useQuery({
    queryKey: ["comments", "video", videoId, params],
    queryFn: async () => {
      const response = await commentApi.getVideoComments(videoId, {
        page: params.page || 1,
        limit: params.limit || 20,
      });
      return response.data;
    },
    enabled: !!videoId,
  });
}

/**
 * Custom hook to add a comment to a video
 */
export function useAddComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentApi.addVideoComment(videoId, content),
    onSuccess: (response) => {
      const newComment = response.data;
      const commentWithStats: CommentWithStats = {
        ...newComment,
        likesCount: 0,
        isLiked: false,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueriesData({ queryKey: ["comments", "video", videoId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          docs: [commentWithStats, ...(oldData.docs || [])],
          totalDocs: (oldData.totalDocs || 0) + 1,
        };
      });

      toast.success(response.message || "Comment added successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to add comment. Please try again.");
    },
  });
}

/**
 * Custom hook to delete a comment
 */
export function useDeleteComment(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.delete,
    // No optimistic update - let the component handle "pending" state visually
    // Error handling provided by component toast
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "video", videoId] });
    },
  });
}

/**
 * Custom hook to toggle like on a comment
 */
export function useToggleCommentLike(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeApi.toggleCommentLike,
    onMutate: async (commentId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["comments", "video", videoId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueriesData({
        queryKey: ["comments", "video", videoId],
      });

      // Optimistically update to the new value
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueriesData({ queryKey: ["comments", "video", videoId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          docs: oldData.docs.map((c: any) => {
            if (c._id === commentId) {
              return {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
              };
            }
            return c;
          }),
        };
      });

      // Return a context object with the snapshotted value
      return { previousComments };
    },
    onError: (error: ApiError, commentId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.response?.data?.message || "Failed to like comment");
    },
    onSettled: () => {
      // Always refetch after error or success:
      // data should be eventually consistent with server
      queryClient.invalidateQueries({ queryKey: ["comments", "video", videoId] });
    },
  });
}

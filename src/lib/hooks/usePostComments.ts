import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/lib/api/comments";
import { likeApi } from "@/lib/api/likes";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { CommentWithStats, ApiResponse, PaginatedResponse } from "@/types";

/**
 * Custom hook to fetch comments for a community post
 */
export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => commentApi.getPostComments(postId, { limit: 100 }),
    select: (data) => data.data.docs,
    enabled: !!postId,
  });
}

/**
 * Custom hook to add a comment to a community post
 */
export function useAddPostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentApi.addPostComment(postId, content),
    onSuccess: () => {
      // Invalidate and refetch immediately to show the new comment
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success("Comment added successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as AxiosError<{ message: string }>)?.response?.data?.message ||
        "Failed to add comment. Please try again.";
      toast.error(errorMessage);
    },
  });
}

/**
 * Custom hook to delete a comment from a community post
 */
export function useDeletePostComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.delete,
    onMutate: async (commentId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<
        ApiResponse<PaginatedResponse<CommentWithStats>>
      >(["post-comments", postId]);

      // Optimistically remove the comment
      queryClient.setQueryData<ApiResponse<PaginatedResponse<CommentWithStats>>>(
        ["post-comments", postId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              docs: old.data.docs.filter((comment) => comment._id !== commentId),
            },
          };
        },
      );

      return { previousComments };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(["post-comments", postId], context.previousComments);
      }
    },
  });
}

/**
 * Custom hook to toggle like on a post comment
 */
export function useTogglePostCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeApi.toggleCommentLike,
    onMutate: async (commentId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueriesData<
        ApiResponse<PaginatedResponse<CommentWithStats>>
      >({ queryKey: ["post-comments", postId] });

      // Optimistically update to the new value
      queryClient.setQueriesData<ApiResponse<PaginatedResponse<CommentWithStats>>>(
        { queryKey: ["post-comments", postId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              docs: oldData.data.docs.map((comment) =>
                comment._id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
                    }
                  : comment,
              ),
            },
          };
        },
      );

      return { previousComments };
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        context.previousComments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const errorMessage =
        (error as AxiosError<{ message: string }>)?.response?.data?.message ||
        "Failed to like comment.";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });
}

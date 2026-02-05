import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "@/lib/api/videos";
import { likeApi } from "@/lib/api/likes";
import { followerApi } from "@/lib/api/followers";
import type {
  PaginatedResponse,
  Video,
  VideoQueryParams,
  VideoWithStats,
  ApiError,
  UserProfile,
} from "@/types";
import { toast } from "sonner";

/**
 * Custom hook to fetch videos with infinite scrolling
 * Uses TanStack Query's useInfiniteQuery for automatic pagination
 */
export function useVideos(params: VideoQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ["videos", params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await videoApi.getAll({
        ...params,
        page: pageParam,
        limit: params.limit || 12,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Custom hook to toggle like on a video
 * Uses optimistic updates for instant UI feedback
 */
export function useToggleVideoLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeApi.toggleVideoLike,
    onMutate: async (videoId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["video", videoId] });
      await queryClient.cancelQueries({ queryKey: ["videos"] });

      // Snapshot the previous value
      const previousVideo = queryClient.getQueryData(["video", videoId]);

      // Optimistically update the single video cache
      queryClient.setQueryData(["video", videoId], (old: VideoWithStats | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !old.isLiked,
          likesCount: old.isLiked ? old.likesCount - 1 : old.likesCount + 1,
        };
      });

      // Optimistically update Watch History
      queryClient.setQueryData(["watchHistory"], (old: PaginatedResponse<Video> | undefined) => {
        if (!old || !old.docs) return old;
        return {
          ...old,
          docs: old.docs.map((video: Video) => {
            if (video._id === videoId) {
              const newIsLiked = !video.isLiked;
              return {
                ...video,
                isLiked: newIsLiked,
                likesCount: Math.max(0, (video.likesCount || 0) + (newIsLiked ? 1 : -1)),
              };
            }
            return video;
          }),
        };
      });

      const previousHistory = queryClient.getQueryData(["watchHistory"]);

      return { previousVideo, previousHistory, videoId };
    },
    onError: (error: ApiError, videoId, context) => {
      // Rollback on error
      if (context?.previousVideo) {
        queryClient.setQueryData(["video", videoId], context.previousVideo);
      }
      if (context?.previousHistory) {
        queryClient.setQueryData(["watchHistory"], context.previousHistory);
      }
      toast.error(error.response?.data?.message || "Failed to like video. Please try again.");
    },
    onSettled: (data, error, videoId) => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] }); // Also update lists
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
      queryClient.invalidateQueries({ queryKey: ["videos", "liked"] });
    },
  });
}

/**
 * Custom hook to toggle follow on a user
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followerApi.toggleFollow,
    onMutate: async (userId) => {
      // Cancel outgoing refetches associated with this user
      await queryClient.cancelQueries({ queryKey: ["video"] });
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });

      const previousVideos = queryClient.getQueriesData({ queryKey: ["video"] });
      const previousProfiles = queryClient.getQueriesData({ queryKey: ["user", "profile"] });

      // Optimistically update Video cache
      queryClient.setQueriesData({ queryKey: ["video"] }, (old: VideoWithStats | undefined) => {
        if (!old || old.owner._id !== userId) return old;
        return {
          ...old,
          owner: {
            ...old.owner,
            isFollowed: !old.owner.isFollowed,
            followersCount: old.owner.isFollowed
              ? old.owner.followersCount - 1
              : old.owner.followersCount + 1,
          },
        };
      });

      // Optimistically update Profile cache
      queryClient.setQueriesData(
        { queryKey: ["user", "profile"] },
        (old: UserProfile | { data: UserProfile } | undefined) => {
          // Handle potential different data structures or direct access
          // Type narrowing to handle both direct object and wrapped in data
          const profile = (old as { data: UserProfile })?.data || (old as UserProfile);
          const targetId = profile?._id;

          if (!targetId || targetId !== userId) return old;

          const currentIsFollowed = profile.isFollowed;
          const newIsFollowed = !currentIsFollowed;

          // Helper to update specific fields
          const updateFields = (obj: UserProfile) => ({
            ...obj,
            isFollowed: newIsFollowed,
            followersCount: newIsFollowed
              ? (obj.followersCount || 0) + 1
              : (obj.followersCount || 0) - 1,
          });

          // If old has match at top level
          if ("_id" in (old as object) && (old as UserProfile)._id === userId) {
            return updateFields(old as UserProfile);
          }

          // If nested in data property (defensive)
          if ("data" in (old as object) && (old as { data: UserProfile }).data?._id === userId) {
            return {
              ...old,
              data: updateFields((old as { data: UserProfile }).data),
            };
          }

          return old;
        },
      );

      return { previousVideos, previousProfiles };
    },
    onError: (err: ApiError, userId, context) => {
      // Rollback
      if (context?.previousVideos) {
        context.previousVideos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProfiles) {
        context.previousProfiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        err.response?.data?.message || "Failed to update follow status. Please try again.",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

/**
 * Hook to update video details (title, description)
 */
export function useUpdateVideoDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      data,
    }: {
      videoId: string;
      data: { title: string; description: string };
    }) => videoApi.updateDetails(videoId, data),
    onSuccess: (response) => {
      const video = response.data;
      queryClient.invalidateQueries({ queryKey: ["video", video._id] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["my-videos"] });
      // toast.success removed for component-level handling
    },
  });
}

/**
 * Hook to update video thumbnail
 */
export function useUpdateVideoThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, thumbnail }: { videoId: string; thumbnail: File }) =>
      videoApi.updateThumbnail(videoId, thumbnail),
    onSuccess: (response) => {
      const video = response.data;
      queryClient.invalidateQueries({ queryKey: ["video", video._id] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["my-videos"] });
      // toast.success removed for component-level handling
    },
  });
}

/**
 * Hook to toggle publish status
 */
export function useTogglePublishStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => videoApi.togglePublishStatus(videoId),
    onSuccess: (response) => {
      const { videoId, isPublished } = response.data;
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["my-videos"] });
      toast.success(`Video is now ${isPublished ? "Public" : "Private"}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update visibility");
    },
  });
}

/**
 * Hook to delete video
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => videoApi.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["my-videos"] });
    },
  });
}

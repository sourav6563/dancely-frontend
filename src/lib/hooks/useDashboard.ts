import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { videoApi } from "@/lib/api/videos";
import { toast } from "sonner";

import { dashboardApi } from "@/lib/api/dashboard";
import type { ApiError } from "@/types";

/**
 * Custom hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data;
    },
  });
}

/**
 * Custom hook to fetch current user's videos
 */
export function useMyVideos() {
  return useQuery({
    queryKey: ["videos", "my"],
    queryFn: async () => {
      const response = await videoApi.getMyVideos();
      return response.data;
    },
  });
}

/**
 * Custom hook to delete a video
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videoApi.delete,
    onSuccess: () => {
      // Invalidate and refetch videos
      queryClient.invalidateQueries({ queryKey: ["videos", "my"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

/**
 * Custom hook to toggle video publish status
 */
export function useTogglePublishStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videoApi.togglePublishStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", "my"] });
      toast.success("Video status updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to update video status. Please try again.",
      );
    },
  });
}

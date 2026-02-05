import api from "./client";
import type { ApiResponse, Video } from "@/types";

/**
 * Like API endpoints
 * These functions communicate with the backend like routes
 */
export const likeApi = {
  /**
   * Toggle like on a video
   * POST /like/toggle-video-like/:videoId
   */
  toggleVideoLike: async (videoId: string): Promise<ApiResponse<{ isLiked: boolean }>> => {
    const response = await api.post(`/like/toggle-video-like/${videoId}`);
    return response.data;
  },

  /**
   * Toggle like on a comment
   * POST /like/toggle-comment-like/:commentId
   */
  toggleCommentLike: async (commentId: string): Promise<ApiResponse<{ isLiked: boolean }>> => {
    const response = await api.post(`/like/toggle-comment-like/${commentId}`);
    return response.data;
  },

  /**
   * Toggle like on a community post
   * POST /like/toggle-community-post-like/:postId
   */
  togglePostLike: async (postId: string): Promise<ApiResponse<{ isLiked: boolean }>> => {
    const response = await api.post(`/like/toggle-community-post-like/${postId}`);
    return response.data;
  },

  /**
   * Get all liked videos
   * GET /like/liked-videos
   */
  getLikedVideos: async (): Promise<ApiResponse<Video[]>> => {
    const response = await api.get("/like/liked-videos");
    return response.data;
  },
};

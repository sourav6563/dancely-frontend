import api from "./client";
import type {
  ApiResponse,
  CommentWithStats,
  PaginatedResponse,
  PaginationParams,
  Comment,
} from "@/types";

/**
 * Comment API endpoints
 * These functions communicate with the backend comment routes
 */
export const commentApi = {
  /**
   * Get comments for a video with pagination
   * GET /comment/video-comments/:videoId
   */
  getVideoComments: async (
    videoId: string,
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<CommentWithStats>>> => {
    const response = await api.get(`/comment/video-comments/${videoId}`, { params });
    return response.data;
  },

  /**
   * Add a comment to a video
   * POST /comment/video-comments/:videoId
   */
  addVideoComment: async (videoId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await api.post(`/comment/video-comments/${videoId}`, { content });
    return response.data;
  },

  /**
   * Get comments for a community post with pagination
   * GET /comment/post-comments/:postId
   */
  getPostComments: async (
    postId: string,
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<CommentWithStats>>> => {
    const response = await api.get(`/comment/post-comments/${postId}`, { params });
    return response.data;
  },

  /**
   * Add a comment to a community post
   * POST /comment/post-comments/:postId
   */
  addPostComment: async (postId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await api.post(`/comment/post-comments/${postId}`, { content });
    return response.data;
  },

  /**
   * Update a comment
   * PATCH /comment/:commentId
   */
  update: async (commentId: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await api.patch(`/comment/${commentId}`, { content });
    return response.data;
  },

  /**
   * Delete a comment
   * DELETE /comment/:commentId
   */
  delete: async (commentId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/comment/${commentId}`);
    return response.data;
  },
};

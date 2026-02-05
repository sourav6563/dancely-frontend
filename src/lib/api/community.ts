import api from "./client";
import type {
  ApiResponse,
  CommunityPost,
  PaginatedResponse,
  PaginationParams,
  CommunityPostWithStats,
} from "@/types";

/**
 * Community Post API endpoints
 * These functions communicate with the backend community post routes
 */
export const communityApi = {
  /**
   * Create a new community post
   * POST /communitypost
   */
  create: async (content: string): Promise<ApiResponse<CommunityPost>> => {
    const response = await api.post("/communitypost", { content });
    return response.data;
  },

  /**
   * Get user's community posts
   * GET /communitypost/user/:userId
   */
  getUserPosts: async (
    userId: string,
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<CommunityPostWithStats>>> => {
    const response = await api.get(`/communitypost/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Get all community posts (global feed)
   * GET /communitypost/feed
   */
  getAllPosts: async (
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<CommunityPostWithStats>>> => {
    const response = await api.get("/communitypost/feed", { params });
    return response.data;
  },

  /**
   * Update a community post
   * PATCH /communitypost/:postId
   */
  update: async (postId: string, content: string): Promise<ApiResponse<CommunityPost>> => {
    const response = await api.patch(`/communitypost/${postId}`, { content });
    return response.data;
  },

  /**
   * Delete a community post
   * DELETE /communitypost/:postId
   */
  delete: async (postId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/communitypost/${postId}`);
    return response.data;
  },
};

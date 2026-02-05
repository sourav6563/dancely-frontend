import api from "./client";
import type {
  ApiResponse,
  FollowerUser,
  FollowingUser,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

/**
 * Follower API endpoints
 * These functions communicate with the backend follower routes
 */
export const followerApi = {
  /**
   * Toggle follow status for a user
   * POST /follower/toggle/:userId
   */
  toggleFollow: async (userId: string): Promise<ApiResponse<{ isFollowed: boolean }>> => {
    const response = await api.post(`/follower/toggle/${userId}`);
    return response.data;
  },

  /**
   * Get user's followers with pagination
   * GET /follower/followers/:userId
   */
  getFollowers: async (
    userId: string,
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<FollowerUser>>> => {
    const response = await api.get(`/follower/followers/${userId}`, { params });
    return response.data;
  },

  /**
   * Get user's following list with pagination
   * GET /follower/following/:userId
   */
  getFollowing: async (
    userId: string,
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<FollowingUser>>> => {
    const response = await api.get(`/follower/following/${userId}`, { params });
    return response.data;
  },
};

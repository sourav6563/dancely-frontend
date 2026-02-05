import api from "./client";
import type { ApiResponse, UserProfile, User, PaginatedResponse, Video } from "@/types";

/**
 * User API endpoints
 * These functions communicate with the backend user routes
 */
export const userApi = {
  /**
   * Get user profile by username
   * GET /user/:username
   */
  getProfile: async (username: string): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get(`/user/${username}`);
    return response.data;
  },

  /**
   * Get watch history with pagination
   * GET /user/history
   */
  getWatchHistory: async (
    params: { page?: number; limit?: number } = {},
  ): Promise<ApiResponse<PaginatedResponse<Video>>> => {
    const response = await api.get("/user/history", { params });
    return response.data;
  },

  /**
   * Update user name
   * PATCH /user/name
   */
  updateName: async (name: string): Promise<ApiResponse<User>> => {
    const response = await api.patch("/user/name", { name });
    return response.data;
  },

  /**
   * Update user email
   * PATCH /user/email
   */
  updateEmail: async (email: string): Promise<ApiResponse<User>> => {
    const response = await api.patch("/user/email", { email });
    return response.data;
  },

  /**
   * Update user bio
   * PATCH /user/bio
   */
  updateBio: async (bio: string): Promise<ApiResponse<User>> => {
    const response = await api.patch("/user/bio", { bio });
    return response.data;
  },

  /**
   * Update profile image
   * PATCH /user/profileimage
   */
  updateProfileImage: async (profileImage: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);

    const response = await api.patch("/user/profileimage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Search users by query
   * GET /user/search
   */
  search: async (query: string): Promise<ApiResponse<User[]>> => {
    const response = await api.get("/user/search", { params: { query } });
    return response.data;
  },
};

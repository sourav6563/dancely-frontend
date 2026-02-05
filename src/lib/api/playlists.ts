import api from "./client";
import type { ApiResponse, Playlist, PaginatedResponse, PaginationParams } from "@/types";

/**
 * Playlist API endpoints
 * These functions communicate with the backend playlist routes
 */
export const playlistApi = {
  /**
   * Create a new playlist
   * POST /playlist
   */
  create: async (data: {
    name: string;
    description: string;
    isPublished?: boolean;
  }): Promise<ApiResponse<Playlist>> => {
    const response = await api.post("/playlist", data);
    return response.data;
  },

  /**
   * Get current user's playlists
   * GET /playlist/me
   */
  getMyPlaylists: async (
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<Playlist>>> => {
    const response = await api.get("/playlist/me", { params });
    return response.data;
  },

  /**
   * Get user's playlists by userId
   * GET /playlist/user/:userId
   */
  getUserPlaylists: async (userId: string): Promise<ApiResponse<Playlist[]>> => {
    const response = await api.get(`/playlist/user/${userId}`);
    return response.data;
  },

  /**
   * Get playlist by ID
   * GET /playlist/:playlistId
   */
  getById: async (playlistId: string): Promise<ApiResponse<Playlist>> => {
    const response = await api.get(`/playlist/${playlistId}`);
    return response.data;
  },

  /**
   * Update playlist
   * PATCH /playlist/:playlistId
   */
  update: async (
    playlistId: string,
    data: { name?: string; description?: string; isPublished?: boolean },
  ): Promise<ApiResponse<Playlist>> => {
    const response = await api.patch(`/playlist/${playlistId}`, data);
    return response.data;
  },

  /**
   * Delete playlist
   * DELETE /playlist/:playlistId
   */
  delete: async (playlistId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/playlist/${playlistId}`);
    return response.data;
  },

  /**
   * Add video to playlist
   * POST /playlist/:playlistId/videos/:videoId
   */
  addVideo: async (playlistId: string, videoId: string): Promise<ApiResponse<Playlist>> => {
    const response = await api.post(`/playlist/${playlistId}/videos/${videoId}`);
    return response.data;
  },

  /**
   * Remove video from playlist
   * DELETE /playlist/:playlistId/videos/:videoId
   */
  removeVideo: async (playlistId: string, videoId: string): Promise<ApiResponse<Playlist>> => {
    const response = await api.delete(`/playlist/${playlistId}/videos/${videoId}`);
    return response.data;
  },
};

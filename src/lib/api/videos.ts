import api from "./client";
import { AxiosProgressEvent } from "axios";
import type {
  ApiResponse,
  Video,
  VideoWithStats,
  MyVideo,
  PaginatedResponse,
  VideoQueryParams,
  PaginationParams,
  UpdateVideoData,
} from "@/types";

/**
 * Video API endpoints
 * These functions communicate with the backend video routes
 */
export const videoApi = {
  /**
   * Get all published videos with pagination and filters
   * GET /video
   */
  getAll: async (params: VideoQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Video>>> => {
    const response = await api.get("/video", { params });
    return response.data;
  },

  /**
   * Get video by ID with detailed stats
   * GET /video/:videoId
   */
  getById: async (videoId: string): Promise<ApiResponse<VideoWithStats>> => {
    const response = await api.get(`/video/${videoId}`);
    return response.data;
  },

  /**
   * Get current user's uploaded videos
   * GET /video/me
   */
  getMyVideos: async (
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResponse<MyVideo>>> => {
    const response = await api.get("/video/me", { params });
    return response.data;
  },

  /**
   * Upload a new video
   * POST /video
   * Multipart form data with video file, thumbnail, title, description
   */
  upload: async (
    formData: FormData,
    onProgress?: (progressEvent: AxiosProgressEvent) => void,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Video>> => {
    const response = await api.post("/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
      signal,
    });
    return response.data;
  },

  /**
   * Update video details (title, description)
   * PATCH /video/:videoId
   */
  updateDetails: async (videoId: string, data: UpdateVideoData): Promise<ApiResponse<Video>> => {
    const response = await api.patch(`/video/${videoId}`, data);
    return response.data;
  },

  /**
   * Update video thumbnail
   * PATCH /video/thumbnail/:videoId
   */
  updateThumbnail: async (videoId: string, thumbnail: File): Promise<ApiResponse<Video>> => {
    const formData = new FormData();
    formData.append("thumbnail", thumbnail);

    const response = await api.patch(`/video/thumbnail/${videoId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Toggle video publish status
   * PATCH /video/publish-status/:videoId
   */
  togglePublishStatus: async (
    videoId: string,
  ): Promise<ApiResponse<{ videoId: string; isPublished: boolean }>> => {
    const response = await api.patch(`/video/publish-status/${videoId}`);
    return response.data;
  },

  /**
   * Delete video and all related data
   * DELETE /video/:videoId
   */
  delete: async (videoId: string): Promise<ApiResponse<{ deletedVideoId: string }>> => {
    const response = await api.delete(`/video/${videoId}`);
    return response.data;
  },
};

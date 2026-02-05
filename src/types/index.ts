// Core type definitions based on backend API responses

// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  profileImage: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  profileImage: string;
  isVerified: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  totalViews?: number;
  totalLikes?: number;
  isFollowed: boolean;
  isFollowedByMe: boolean;
}

// Video types
export interface VideoOwner {
  _id: string;
  username: string;
  name: string;
  profileImage: string;
}

export interface Video {
  _id: string;
  owner: VideoOwner;
  title: string;
  description: string;
  videoFile: {
    url: string;
    public_id: string;
  };
  thumbnail: {
    url: string;
    public_id: string;
  };
  duration: number;
  views: number;
  isPublished: boolean;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface VideoWithStats extends Video {
  owner: VideoOwner & {
    followersCount: number;
    isFollowed: boolean;
  };
  likesCount: number;
  isLiked: boolean;
}

export interface MyVideo {
  _id: string;
  title: string;
  description: string;
  videoFile: {
    url: string;
    public_id: string;
  };
  thumbnail: {
    url: string;
    public_id: string;
  };
  duration: number;
  views: number;
  likesCount: number;
  isLiked?: boolean; // Optional for MyVideo as it might not be populated in dashboard
  isPublished: boolean;
  owner: VideoOwner;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface CommentOwner {
  _id: string;
  username: string;
  name: string;
  profileImage: string;
}

export interface Comment {
  _id: string;
  content: string;
  owner: CommentOwner;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithStats extends Comment {
  likesCount: number;
  isLiked: boolean;
}

// Playlist types
export interface Playlist {
  _id: string;
  name: string;
  description: string;
  videos: Array<{
    _id: string;
    title: string;
    thumbnail: string | { url: string };
    duration?: number;
    views?: number;
    owner?: VideoOwner | string;
  }>;
  totalVideos: number;
  playlistThumbnail: string;
  owner: string | VideoOwner;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Follower types
export interface FollowerUser {
  _id: string;
  username: string;
  name: string;
  profileImage: string;
  userId: string;
  createdAt: string;
}

export type FollowingUser = FollowerUser;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Video query params
export interface VideoQueryParams extends PaginationParams {
  query?: string;
  sortBy?: "createdAt" | "views" | "title";
  sortOrder?: "asc" | "desc";
  userId?: string;
}

// API response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

// Auth types
export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Upload types
export interface UploadVideoData {
  title: string;
  description: string;
  video: File;
  thumbnail: File;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
}

// Dashboard types
export interface DashboardStats {
  totalVideos: number;
  totalViews: number;
  totalFollowers: number;
  totalLikes: number;
}

// Community Post types
export interface CommunityPostOwner {
  _id: string;
  username: string;
  name: string;
  profileImage: string;
}

export interface CommunityPost {
  _id: string;
  content: string;
  owner: CommunityPostOwner;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostWithStats extends CommunityPost {
  likesCount: number;
  isLiked: boolean;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      statusCode?: number;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

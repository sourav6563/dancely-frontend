import api from "./client";
import type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterData,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
} from "@/types";

/**
 * Authentication API endpoints
 * These functions communicate with the backend auth routes
 */
export const authApi = {
  /**
   * Check if username is available
   * GET /auth/check-username
   */
  checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await api.get("/auth/check-username", {
      params: { username },
    });
    return response.data;
  },

  /**
   * Register a new user
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Verify user email with code
   * POST /auth/verify-account
   */
  verifyEmail: async (data: VerifyEmailData): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/verify-account", data);
    return response.data;
  },

  /**
   * Login user
   * POST /auth/login
   * Sets access and refresh tokens in HTTP-only cookies
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Logout user
   * POST /auth/logout
   * Clears tokens from cookies
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Refresh access token
   * POST /auth/refresh-token
   */
  refreshToken: async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },

  /**
   * Request password reset code
   * POST /auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  /**
   * Reset password with code
   * POST /auth/reset-password
   */
  resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  /**
   * Change password (when logged in)
   * POST /auth/change-password
   */
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};

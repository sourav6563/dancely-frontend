import api from "./client";
import type { ApiResponse, DashboardStats } from "@/types";

/**
 * Dashboard API endpoints
 * These functions communicate with the backend dashboard routes
 */
export const dashboardApi = {
  /**
   * Get channel dashboard statistics
   * GET /dashboard/stats
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
};

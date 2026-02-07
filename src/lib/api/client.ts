import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;

// Queue for requests that fail while refreshing
interface FailedRequestPromise {
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: FailedRequestPromise[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Helper to dispatch a custom event when auth session is invalidated
// This allows AuthContext to react and clear its state
const dispatchAuthInvalidated = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-invalidated"));
  }
};

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if the refresh token endpoint itself fails
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      console.warn("[API] Refresh token failed. Dispatching auth-invalidated.");
      // Refresh token itself failed - dispatch event to clear auth state
      dispatchAuthInvalidated();
      return Promise.reject(error);
    }

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message;

      // Don't try to refresh for login/register endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        return Promise.reject(error);
      }

      console.log("[API] 401 error detected. Message:", errorMessage);

      // Only try to refresh if the token is specifically expired.
      // For other 401 errors (missing/invalid token), just reject
      if (errorMessage !== "ACCESS_TOKEN_EXPIRED") {
        console.warn("[API] 401 error is NOT ACCESS_TOKEN_EXPIRED. Rejecting.");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API] Attempting to refresh access token...");
        // Try to refresh the access token
        await api.post("/auth/refresh-token");
        console.log("[API] Refresh successful. Retrying original request.");

        // Retry original request (browser will automatically send the new cookies)
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[API] Refresh failed:", refreshError);
        processQueue(refreshError);
        // Refresh failed - dispatch event to clear auth state
        dispatchAuthInvalidated();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

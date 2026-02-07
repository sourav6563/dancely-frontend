import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http:localhost:3000/api/v1",
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

// Helper function to redirect to login page
const redirectToLogin = (): void => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
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
      return Promise.reject(error);
    }

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message;

      // Don't redirect to login if the failed request is /auth/me, /auth/login, or /auth/register
      // This allows unauthenticated users to see the landing page or handle login errors gracefully
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        return Promise.reject(error);
      }

      // Optimization: Only try to refresh if the token is specifically expired.
      // If the error is "UNAUTHORIZED" (missing/invalid), refresh will fail anyway.
      if (errorMessage !== "ACCESS_TOKEN_EXPIRED") {
        if (!originalRequest.url?.includes("/auth/me")) {
          redirectToLogin();
        }
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
        // Try to refresh the access token
        await api.post("/auth/refresh-token");

        // Retry original request (browser will automatically send the new cookies)
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed, redirect to login ONLY if it wasn't a background auth check
        if (!originalRequest.url?.includes("/auth/me")) {
          redirectToLogin();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

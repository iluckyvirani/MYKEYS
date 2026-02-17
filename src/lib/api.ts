import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Request Interceptor - Add access token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request was already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if user had a token before (was authenticated)
    const hadToken = !!localStorage.getItem("accessToken");
    
    // Don't try to refresh if there was no token to begin with
    if (!hadToken) {
      return Promise.reject(error);
    }

    // If already refreshing tokens, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark as refreshing and start refresh process
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Call refresh endpoint
      const response = await axios.post(
        "http://localhost:3000/api/auth/refresh",
        { refreshToken }
      );

      if (response.data?.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update stored tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update default header
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        return api(originalRequest);
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);

      // Clear tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Process queued requests with error
      processQueue(refreshError, null);

      // Only redirect to login if not already on login page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login")) {
          window.location.href = "/login";
        }
      }

      return Promise.reject(refreshError);
    }
  }
);

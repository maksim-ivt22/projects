import axios from "axios";
import { API_BASE_URL } from "./constants";
import {
  getStoredRefreshToken,
  removeStoredRefreshToken,
  setStoredRefreshToken,
} from "./auth-storage";
import { getAccessToken, setAccessToken } from "./token-manager";
import authService from "../services/auth-service";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err); // Propagate refresh failure
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        console.log("No refresh token available.");
        isRefreshing = false;
        // Here you might trigger a global logout action if you have one
        removeStoredRefreshToken();
        setAccessToken(null); // Clear in-memory token
        processQueue(error, null); // Reject queued requests
        // window.location.href = '/login'; // Or redirect
        return Promise.reject(error);
      }

      try {
        const tokens = await authService.refreshToken({
          refresh: refreshToken,
        });

        setStoredRefreshToken(tokens.refresh);
        setAccessToken(tokens.access); // Update in-memory token

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${tokens.access}`;
        }

        processQueue(null, tokens.access); // Resolve queued requests with new token
        return api(originalRequest); // Retry the original request
      } catch (refreshError: any) {
        console.error("Unable to refresh token:", refreshError);
        removeStoredRefreshToken();
        setAccessToken(null);
        processQueue(refreshError, null); // Reject queued requests
        isRefreshing = false;
        // Trigger global logout / redirect
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        // isRefreshing = false; // Moved inside processQueue calls essentially
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;

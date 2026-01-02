import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Crucial for sending/receiving refreshToken cookie
});

// Flag to track if a refresh is already in progress
let isRefreshing = false;
// Queue of callbacks to resolve when refresh completes
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to notify all queued requests with the new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Helper to add a request to the queue
const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Request interceptor: attach current access token if available
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response, // Success → just pass through
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 and avoid retry loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry // Custom flag to prevent infinite loop
    ) {
      if (isRefreshing) {
        // Refresh already in progress → queue this request
        return new Promise((resolve, reject) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Mark as retrying and start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (sends refreshToken cookie automatically)
        const response = await api.post( `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`); // Adjust path if needed

        const { accessToken: newAccessToken } = response.data;

        // Update Zustand store
        // useAuthStore.getState().setAccessToken({ accessToken: newAccessToken });
        
        useAuthStore.getState().setAccessToken(newAccessToken);
        // Notify all queued requests
        onRefreshed(newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → likely logged out (invalid/expired refresh token)
        useAuthStore.getState().clearAuth();

        // Optional: redirect to login
        // if (typeof window !== 'undefined') window.location.href = '/login';

        // Reject all queued requests
        refreshSubscribers.forEach((callback) => callback(''));
        refreshSubscribers = [];

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For any other error (including 401 from refresh itself), just reject
    return Promise.reject(error);
  }
);

export default api;
// utils/api.ts or similar
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Important: still needed for refresh token cookie
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

// Interceptor to automatically add token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;

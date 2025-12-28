import { useAuthStore } from '@/store/authStore'; 
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Important: still needed for refresh token cookie
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; // fresh every time

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default api;

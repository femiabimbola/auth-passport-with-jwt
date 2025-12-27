import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // adjust path

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // still needed for refresh token cookie
});

// We'll store the interceptor ID so we can eject and re-apply it if needed
let currentInterceptor: number | null = null;

// Function to update the interceptor based on current token
const updateAuthInterceptor = () => {
  // Eject previous interceptor if exists
  if (currentInterceptor !== null) {
    api.interceptors.request.eject(currentInterceptor);
  }

  const token = useAuthStore.getState().accessToken;

  currentInterceptor = api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// Initial setup
updateAuthInterceptor();

// Subscribe to store changes and update interceptor whenever token changes
useAuthStore.subscribe((state) => {
  if (state.accessToken !== useAuthStore.getState().accessToken) {
    updateAuthInterceptor();
  }
});

export default api;
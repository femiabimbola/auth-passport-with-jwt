import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}


// MUCH BETTTER!!!
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (payload: any) => set({ accessToken: payload.accessToken }),
  clearAuth: () => set({ accessToken: null }),
}));
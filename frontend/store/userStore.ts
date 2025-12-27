import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start as true to prevent "flicker" on page load
  setUser: (user) => set({ user, isLoading: false }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, isLoading: false }),
}));
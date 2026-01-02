import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

//  NOT GOOD
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      // Fixed: accept the token string or null directly
      setAccessToken: (payload: any) => set({ accessToken: payload.accessToken }),
      // setAccessToken: (token: string | null) => set({ accessToken: token }),
      clearAuth: () => set({ accessToken: null }),
    }),
    {
      name: 'auth-storage', // Unique name for the item in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);


// MUCH BETTTER!!!
// export const useAuthStore = create<AuthState>((set) => ({
//   accessToken: null,
//   setAccessToken: (payload: any) => set({ accessToken: payload.accessToken }),
// }));
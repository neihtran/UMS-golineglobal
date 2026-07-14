import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  tempToken: string | null;
  mfaUserId: string | null;

  // Actions
  login: (user: User, accessToken: string, refreshToken: string) => void;
  loginMfaRequired: (tempToken: string, userId?: string) => void;
  completeMfaLogin: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string) => void;
  checkAuth: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      mfaRequired: false,
      tempToken: null,
      mfaUserId: null,

      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          mfaRequired: false,
          tempToken: null,
          mfaUserId: null,
        }),

      loginMfaRequired: (tempToken, userId) =>
        set({
          mfaRequired: true,
          tempToken,
          mfaUserId: userId || null,
          isLoading: false,
        }),

      completeMfaLogin: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          mfaRequired: false,
          tempToken: null,
          mfaUserId: null,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          mfaRequired: false,
          tempToken: null,
          mfaUserId: null,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setAccessToken: (accessToken) => set({ accessToken }),

      checkAuth: () => {
        const { accessToken, user } = get();
        const isAuthenticated = !!accessToken && !!user;
        set({ isAuthenticated, isLoading: false });
      },

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'ums-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

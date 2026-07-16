import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';
import { ROLES } from '@/constants/modules';

// ─── DEV BYPASS ─────────────────────────────────────────────────────────
// Auto-login as admin when no session exists (for testing without backend login).
// Set VITE_DEV_BYPASS_AUTH=true in .env to enable.
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

const DEV_DEMO_USER: User = {
  id: 'dev-admin-001',
  email: 'dev-admin@ums.local',
  name: 'Dev Admin',
  username: 'devadmin',
  displayName: 'Dev Admin',
  role: ROLES.ADMIN,
  permissions: ['*'],
  department: 'dev-dept',
  title: 'Quản trị viên',
  phone: '0900000000',
  status: 'active',
  mfaEnabled: false,
  avatar: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

        // DEV BYPASS: Auto-login as admin when no session exists
        if (DEV_BYPASS_AUTH && !accessToken && !user) {
          set({
            user: DEV_DEMO_USER,
            accessToken: 'dev-bypass-token',
            refreshToken: 'dev-bypass-refresh',
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

// ─── Custom storage adapter ─────────────────────────────────────────────────────────
// Intercepts localStorage reads/writes to block dev-token from being persisted.
// Runs BEFORE Zustand persist reads on module init (synchronous singleton).
const devSafeStorage = {
  getItem: (): string | null => {
    try {
      return localStorage.getItem('ums-auth');
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch { /* quota exceeded */ }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

// ─── Auth Store ─────────────────────────────────────────────────────────────────
// Used by apiClient interceptor to attach JWT to every request.
// Also used by AuthContext in providers.tsx for the useAuth() hook.

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: {
    tempToken: string;
    user: User;
  } | null;
  _hasHydrated: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  setMfaPending: (tempToken: string, user: User) => void;
  clearMfaPending: () => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      mfaPending: null,
      _hasHydrated: false,

      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          mfaPending: null,
        }),

      setMfaPending: (tempToken, user) =>
        set({ mfaPending: { tempToken, user } }),

      clearMfaPending: () => set({ mfaPending: null }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          mfaPending: null,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
    }),
    {
      name: 'ums-auth',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: devSafeStorage as any,
      // Only persist tokens and user — NOT mfaPending or isLoading.
      // Also block dev-token from being saved on login.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: ((state: any): any => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      })) as any,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

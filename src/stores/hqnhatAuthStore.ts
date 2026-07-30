// ─── HQNhat API Auth Store ─────────────────────────────────────────────────
// Persistent token for the external HQNhat UMS API (https://api.hqnhat.id.vn).
// Independent from the local app auth — backend HQNhat uses its own JWT.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HqnhatAuthState {
  accessToken: string | null;
  username: string | null;
  roles: string[];
  isAuthenticated: boolean;
  setCredentials: (token: string, username: string, roles?: string[]) => void;
  setToken: (token: string) => void;
  setRoles: (roles: string[]) => void;
  clear: () => void;
}

export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';
export const ROLE_ADMIN = 'ADMIN';
export const ADMIN_ROLES = [ROLE_SUPER_ADMIN, ROLE_ADMIN] as const;

export const hasHqnhatAdminRole = (roles: string[] = []): boolean =>
  roles.some(r => ADMIN_ROLES.includes(r as typeof ADMIN_ROLES[number]));

export const useHqnhatAuthStore = create<HqnhatAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      username: null,
      roles: [],
      isAuthenticated: false,

      setCredentials: (token, username, roles = []) => {
        localStorage.setItem('ums-hqnhat-token', token);
        set({ accessToken: token, username, roles, isAuthenticated: true });
      },

      setToken: (token) => {
        localStorage.setItem('ums-hqnhat-token', token);
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setRoles: (roles) => {
        set({ roles: Array.isArray(roles) ? roles : [] });
      },

      clear: () => {
        localStorage.removeItem('ums-hqnhat-token');
        set({ accessToken: null, username: null, roles: [], isAuthenticated: false });
      },
    }),
    {
      name: 'ums-hqnhat-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        username: state.username,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Synchronous getter — useful for interceptors
export const getHqnhatToken = (): string | null => {
  const fromStore = useHqnhatAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  // Fallback to raw localStorage to survive HMR
  try {
    return localStorage.getItem('ums-hqnhat-token');
  } catch {
    return null;
  }
};

// Clear synchronously (used on 401)
export const clearHqnhatToken = () => {
  try {
    localStorage.removeItem('ums-hqnhat-token');
  } catch {
    // ignore
  }
  useHqnhatAuthStore.getState().clear();
};
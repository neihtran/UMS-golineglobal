import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/types/auth.types';
import type { User } from '@/types/auth.types';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: User['role'] | User['role'][] | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: '/dashboard',
  [ROLES.HIEU_TRUONG]: '/dashboard',
  [ROLES.PHO_HIEU_TRUONG]: '/dashboard',
  [ROLES.TRUONG_KHOA]: '/dashboard',
  [ROLES.GIAO_VIEN]: '/portal',
  [ROLES.NHAN_VIEN]: '/hrm',
  [ROLES.SINH_VIEN]: '/portal',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Read from Zustand store directly (not via context) — always fresh
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      const payload = res.data as { mfaRequired?: boolean; tempToken?: string; user?: User; accessToken?: string; refreshToken?: string };

      if (payload.mfaRequired && payload.tempToken && payload.user) {
        useAuthStore.getState().setMfaPending(payload.tempToken, payload.user);
        setIsLoading(false);
        return { mfaRequired: true };
      }

      if (payload.user && payload.accessToken && payload.refreshToken) {
        useAuthStore.getState().login(payload.user, payload.accessToken, payload.refreshToken);
        navigate(ROLE_DASHBOARD_MAP[payload.user.role] ?? '/dashboard');
        return {};
      }

      setIsLoading(false);
      return { error: 'Phản hồi không hợp lệ từ server' };
    } catch (err: unknown) {
      setIsLoading(false);
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const msg = axiosErr.response?.data?.error?.message || axiosErr.message || 'Đăng nhập thất bại';
      return { error: msg };
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    }
    useAuthStore.getState().logout();
    navigate('/');
  }, [navigate]);

  const hasPermission = useCallback((permission: string): boolean => {
    const { user: u } = useAuthStore.getState();
    if (!u) return false;
    if (u.permissions.includes('*')) return true;
    return u.permissions.some(
      (p) => p === permission || (p.endsWith('.*') && permission.startsWith(p.slice(0, -1)))
    );
  }, []);

  const hasRole = useCallback((roles: User['role'] | User['role'][] | string[]): boolean => {
    const { user: u } = useAuthStore.getState();
    if (!u) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(u.role as string);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

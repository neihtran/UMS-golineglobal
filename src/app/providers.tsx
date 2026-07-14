import React from 'react';
import { ROLES } from '@/types/auth.types';
import type { User } from '@/types/auth.types';
import { useAuthStore } from '@/stores/authStore';

// Role aliases — maps shorthand names from localStorage sessions to full ROLES constants
const ROLE_ALIASES: Record<string, string> = {
  admin: ROLES.ADMIN,
  'hieu-truong': ROLES.HIEU_TRUONG,
  'pho-hieu-truong': ROLES.PHO_HIEU_TRUONG,
  'truong-khoa': ROLES.TRUONG_KHOA,
  'giao-vien': ROLES.GIAO_VIEN,
  'nhan-vien': ROLES.NHAN_VIEN,
  'sinh-vien': ROLES.SINH_VIEN,
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: User['role'] | User['role'][]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuthStore();

  const login = async (_email: string, _password: string) => {
    // Login is handled by useLogin hook in the Login page
    // This is just a stub for the context
    console.log('Login should be called via useLogin hook');
  };

  const logout = () => {
    // Logout is handled by useLogout hook
    console.log('Logout should be called via useLogout hook');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.some(
      (p) => p === permission || (p.endsWith('.*') && permission.startsWith(p.slice(0, -1))),
    );
  };

  const hasRole = (roles: User['role'] | User['role'][]): boolean => {
    if (!user) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(user.role);
  };

  // Migrate legacy role strings on mount
  React.useEffect(() => {
    if (user?.role && user.role in ROLE_ALIASES) {
      // Role is already normalized in the store
    }
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout, 
        hasPermission, 
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

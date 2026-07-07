import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/types/auth.types';
import type { User } from '@/types/auth.types';

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

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo users — 7 roles matching the quick login accounts
const DEMO_USERS: Record<string, User> = {
  [ROLES.ADMIN]: {
    id: 'u001', name: 'Nguyễn Văn Admin', email: 'admin@truong-dhcn.vn',
    role: ROLES.ADMIN, avatar: null, permissions: ['*'],
  },
  [ROLES.HIEU_TRUONG]: {
    id: 'u002', name: 'PGS.TS. Trần Đình Long', email: 'tran.dinh.long@truong.edu.vn',
    role: ROLES.HIEU_TRUONG, avatar: null, permissions: ['*'],
  },
  [ROLES.PHO_HIEU_TRUONG]: {
    id: 'u003', name: 'TS. Nguyễn Thị Lan Hương', email: 'nguyen.thi.lan.huong@truong.edu.vn',
    role: ROLES.PHO_HIEU_TRUONG, avatar: null, permissions: ['*'],
  },
  [ROLES.TRUONG_KHOA]: {
    id: 'u004', name: 'TS. Trường Minh Tuấn', email: 'truong.minh.tuan@truong.edu.vn',
    role: ROLES.TRUONG_KHOA, avatar: null, permissions: ['sis.*', 'hrm.*', 'dms.*', 'rit.*', 'qa.*'],
  },
  [ROLES.GIAO_VIEN]: {
    id: 'u005', name: 'Th.S. Nguyễn Hoàng Long', email: 'nguyen.hoang.long@truong.edu.vn',
    role: ROLES.GIAO_VIEN, avatar: null, permissions: ['lms.*', 'portal.*', 'lib.*', 'sis.*', 'exam.*', 'rit.*', 'dce.*', 'qa.*'],
  },
  [ROLES.NHAN_VIEN]: {
    id: 'u006', name: 'CN. Hoàng Thị Tân', email: 'hoang.thi.tan@truong.edu.vn',
    role: ROLES.NHAN_VIEN, avatar: null, permissions: ['hrm.*', 'dms.*', 'fin.*', 'sis.*', 'wms.*', 'bi.*', 'ktx.*', 'qa.*'],
  },
  [ROLES.SINH_VIEN]: {
    id: 'u007', name: 'Trần Văn Sinh', email: 'sv-2025-0001@sinhvien.truong.edu.vn',
    role: ROLES.SINH_VIEN, avatar: null, permissions: ['portal.sinh-vien', 'portal.*', 'lms.*', 'lib.*', 'exam.view'],
  },
};

// Default demo user
const DEFAULT_USER = DEMO_USERS[ROLES.ADMIN];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('ums_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        // Migrate legacy role strings to new ROLES constants
        if (parsed.role in ROLE_ALIASES) {
          parsed.role = ROLE_ALIASES[parsed.role] as User['role'];
        }
        setUser(parsed);
      } catch {
        localStorage.removeItem('ums_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Demo: find user by email, fallback to ADMIN
    const matchedUser = Object.values(DEMO_USERS).find((u) => u.email === email) ?? DEFAULT_USER;
    const userWithEmail = { ...matchedUser, email };

    setUser(userWithEmail);
    localStorage.setItem('ums_session', JSON.stringify(userWithEmail));

    const roleDashboardMap: Partial<Record<string, string>> = {
      [ROLES.ADMIN]: '/dashboard/admin',
      [ROLES.HIEU_TRUONG]: '/dashboard/bgh',
      [ROLES.PHO_HIEU_TRUONG]: '/dashboard/bgh',
      [ROLES.TRUONG_KHOA]: '/dashboard/truong-khoa',
      [ROLES.GIAO_VIEN]: '/dashboard/giao-vien',
      [ROLES.NHAN_VIEN]: '/dashboard/nhan-vien',
      [ROLES.SINH_VIEN]: '/dashboard/sinh-vien',
    };
    navigate(roleDashboardMap[matchedUser.role] ?? '/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ums_session');
    navigate('/');
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/types/auth.types';
import type { User } from '@/types/auth.types';

// Role aliases — maps shorthand names from localStorage sessions to full ROLES constants
const ROLE_ALIASES: Record<string, string> = {
  admin: ROLES.ADMIN,
  'giang-vien': ROLES.GIAO_VIEN,
  'sinh-vien': ROLES.SINH_VIEN,
  'nhan-vien': ROLES.NHAN_VIEN,
  'hieu-truong': ROLES.HIEU_TRUONG,
  'pho-hieu-truong': ROLES.PHO_HIEU_TRUONG,
  'truong-khoa': ROLES.TRUONG_KHOA,
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

// Demo users — one per role
const DEMO_USERS: Record<string, User> = {
  [ROLES.SUPER_ADMIN]: {
    id: 'u000', name: 'Nguyễn Văn Super', email: 'super@truong.edu.vn',
    role: ROLES.SUPER_ADMIN, avatar: null, permissions: ['*'],
  },
  [ROLES.ADMIN]: {
    id: 'u001', name: 'Nguyễn Văn Admin', email: 'admin@truong.edu.vn',
    role: ROLES.ADMIN, avatar: null, permissions: ['*'],
  },
  [ROLES.HIEU_TRUONG]: {
    id: 'u002', name: 'PGS.TS. Hoàng Văn Minh', email: 'hieu-truong@truong.edu.vn',
    role: ROLES.HIEU_TRUONG, avatar: null, permissions: ['*'],
  },
  [ROLES.PHO_HIEU_TRUONG]: {
    id: 'u003', name: 'TS. Lê Thị Lan', email: 'pho-hieu-truong@truong.edu.vn',
    role: ROLES.PHO_HIEU_TRUONG, avatar: null, permissions: ['*'],
  },
  [ROLES.TRUONG_KHOA]: {
    id: 'u004', name: 'TS. Nguyễn Văn Khoa', email: 'truong-khoa-cntt@truong.edu.vn',
    role: ROLES.TRUONG_KHOA, avatar: null, permissions: ['sis.*', 'hrm.*', 'dms.*', 'rit.*', 'qa.*'],
  },
  [ROLES.PHO_TRUONG_KHOA]: {
    id: 'u005', name: 'TS. Phạm Thị Phó', email: 'photruongkhoa@truong.edu.vn',
    role: ROLES.PHO_TRUONG_KHOA, avatar: null, permissions: ['sis.*', 'hrm.*', 'dms.*'],
  },
  [ROLES.GIAO_VIEN]: {
    id: 'u006', name: 'Th.S. Thảo Nguyễn', email: 'thao.nguyen@truong.edu.vn',
    role: ROLES.GIAO_VIEN, avatar: null, permissions: ['lms.*', 'portal.giang-vien', 'portal.*', 'lib.*', 'sis.*', 'exam.*', 'rit.*', 'dce.*', 'qa.*'],
  },
  [ROLES.CAN_BO_PHAN_CONG]: {
    id: 'u007', name: 'CN. Nguyễn Thị Phân', email: 'phancb@truong.edu.vn',
    role: ROLES.CAN_BO_PHAN_CONG, avatar: null, permissions: ['sis.*', 'wms.*'],
  },
  [ROLES.CHUYEN_VIEN]: {
    id: 'u008', name: 'ThS. Trần Văn Chuyên', email: 'chuyenvien@truong.edu.vn',
    role: ROLES.CHUYEN_VIEN, avatar: null, permissions: ['hrm.*', 'fin.*', 'dms.*', 'wms.*', 'ktx.*'],
  },
  [ROLES.NHAN_VIEN]: {
    id: 'u009', name: 'Chu Hanh', email: 'hanh.chu@truong.edu.vn',
    role: ROLES.NHAN_VIEN, avatar: null, permissions: ['hrm.*', 'dms.*', 'fin.*', 'sis.*', 'wms.*', 'bi.*', 'ktx.*', 'qa.*'],
  },
  [ROLES.SINH_VIEN]: {
    id: 'u010', name: 'Nguyễn Văn An', email: 'an.nguyen@truong.edu.vn',
    role: ROLES.SINH_VIEN, avatar: null, permissions: ['portal.sinh-vien', 'portal.*', 'lms.*', 'lib.*', 'exam.view'],
  },
  [ROLES.KHAI_THA]: {
    id: 'u011', name: 'Lê Văn Khai', email: 'khai.tha@truong.edu.vn',
    role: ROLES.KHAI_THA, avatar: null, permissions: ['bi.bao-cao', 'bi.chi-so'],
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
      [ROLES.SUPER_ADMIN]: '/dashboard',
      [ROLES.ADMIN]: '/dashboard',
      [ROLES.HIEU_TRUONG]: '/dashboard/bgh',
      [ROLES.PHO_HIEU_TRUONG]: '/dashboard/bgh',
      [ROLES.TRUONG_KHOA]: '/dashboard/truong-khoa',
      [ROLES.PHO_TRUONG_KHOA]: '/dashboard/truong-khoa',
      [ROLES.GIAO_VIEN]: '/dashboard/gv',
      [ROLES.CAN_BO_PHAN_CONG]: '/dashboard/gv',
      [ROLES.CHUYEN_VIEN]: '/dashboard/gv',
      [ROLES.NHAN_VIEN]: '/dashboard/gv',
      [ROLES.SINH_VIEN]: '/portal',
      [ROLES.KHAI_THA]: '/bi',
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

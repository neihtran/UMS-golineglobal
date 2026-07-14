// TanStack Query Hooks for Auth
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, LoginResponse } from '@/types/api.types';
import { ROLES } from '@/constants/modules';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.HIEU_TRUONG]: '/dashboard/bgh',
  [ROLES.PHO_HIEU_TRUONG]: '/dashboard/bgh',
  [ROLES.TRUONG_KHOA]: '/dashboard/truong-khoa',
  [ROLES.GIAO_VIEN]: '/dashboard/giao-vien',
  [ROLES.NHAN_VIEN]: '/dashboard/nhan-vien',
  [ROLES.SINH_VIEN]: '/dashboard/sinh-vien',
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const store = useAuthStore.getState();
      
      if (data.mfaRequired && data.tempToken) {
        // MFA required - store temp token and redirect
        store.loginMfaRequired(data.tempToken, data.userId);
        window.location.href = '/auth/mfa';
      } else if (data.user && data.accessToken) {
        // Normal login - store tokens and user
        store.login(
          {
            id: data.user._id || data.user.id,
            email: data.user.email,
            name: data.user.displayName || data.user.name || data.user.email,
            username: data.user.username || data.user.email.split('@')[0],
            displayName: data.user.displayName || data.user.name,
            role: data.user.role,
            permissions: data.user.permissions || [],
            department: data.user.department?._id || data.user.department || '',
            title: data.user.title,
            phone: data.user.phone,
            status: data.user.status || 'active',
            mfaEnabled: data.user.mfaEnabled || false,
            avatar: data.user.avatar || null,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: data.user.updatedAt || new Date().toISOString(),
          },
          data.accessToken,
          data.refreshToken || ''
        );
        
        // Navigate to dashboard
        const dashboard = ROLE_DASHBOARD_MAP[data.user.role] || '/dashboard';
        window.location.href = dashboard;
      }
    },
    onError: (error: any) => {
      // Error is already handled in the component
      console.error('Login error:', error);
      throw error;
    },
  });
};

export const useVerifyMfa = () => {
  return useMutation({
    mutationFn: async ({ tempToken, code }: { tempToken: string; code: string }) => {
      const response = await api.post<LoginResponse>('/auth/mfa', { tempToken, code });
      return response.data;
    },
    onSuccess: (data) => {
      const store = useAuthStore.getState();
      
      if (data.user && data.accessToken) {
        store.completeMfaLogin(
          {
            id: data.user._id || data.user.id,
            email: data.user.email,
            name: data.user.displayName || data.user.name || data.user.email,
            username: data.user.username || data.user.email.split('@')[0],
            displayName: data.user.displayName || data.user.name,
            role: data.user.role,
            permissions: data.user.permissions || [],
            department: data.user.department?._id || data.user.department || '',
            title: data.user.title,
            phone: data.user.phone,
            status: data.user.status || 'active',
            mfaEnabled: true,
            avatar: data.user.avatar || null,
            createdAt: data.user.createdAt || new Date().toISOString(),
            updatedAt: data.user.updatedAt || new Date().toISOString(),
          },
          data.accessToken,
          data.refreshToken || ''
        );
        
        const dashboard = ROLE_DASHBOARD_MAP[data.user.role] || '/dashboard';
        window.location.href = dashboard;
      }
    },
    onError: (error: any) => {
      console.error('MFA verify error:', error);
      throw error;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    },
    onError: () => {
      // Still logout even if API call fails
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    },
  });
};

export const useCurrentUser = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get<{ data: any }>('/auth/me');
      return response.data;
    },
    onSuccess: (data) => {
      useAuthStore.getState().updateUser(data.data);
    },
  });
};

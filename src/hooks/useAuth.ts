// ─── Auth ──────────────────────────────────────────────────────────────────
// Backend: HQNhat IAM API at https://api.hqnhat.id.vn/api/v1/iam/login
// (no localhost:5000 backend exists in this project; only HQNhat is reachable)
import { useMutation } from '@tanstack/react-query';
import { hqnhatApi } from '@/lib/hqnhatApiClient';
import { useAuthStore } from '@/stores/authStore';
import { useHqnhatAuthStore } from '@/stores/hqnhatAuthStore';
import type { LoginRequest, LoginResponse } from '@/types/api.types';
import { ROLES, type Role } from '@/constants/modules';

// Map HQNhat API roles → UMS internal roles
// (HQNhat uses lowercase snake_case; UMS uses SCREAMING_SNAKE_CASE)
const HQNHAT_ROLE_TO_UMS: Record<string, Role> = {
  admin: ROLES.ADMIN,
  super_admin: ROLES.ADMIN,
  hieu_truong: ROLES.HIEU_TRUONG,
  pho_hieu_truong: ROLES.PHO_HIEU_TRUONG,
  truong_khoa: ROLES.TRUONG_KHOA,
  giao_vien: ROLES.GIAO_VIEN,
  lecturer: ROLES.GIAO_VIEN,
  nhan_vien: ROLES.NHAN_VIEN,
  staff: ROLES.NHAN_VIEN,
  employee: ROLES.NHAN_VIEN,
  academic_affairs: ROLES.NHAN_VIEN,
  phong_dao_tao: ROLES.NHAN_VIEN,
  sinh_vien: ROLES.SINH_VIEN,
  student: ROLES.SINH_VIEN,
};

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.HIEU_TRUONG]: '/dashboard/bgh',
  [ROLES.PHO_HIEU_TRUONG]: '/dashboard/bgh',
  [ROLES.TRUONG_KHOA]: '/dashboard/truong-khoa',
  [ROLES.GIAO_VIEN]: '/dashboard/giao-vien',
  [ROLES.NHAN_VIEN]: '/dashboard/nhan-vien',
  [ROLES.SINH_VIEN]: '/dashboard/sinh-vien',
};

// HQNhat login API response shape
interface HqnhatLoginData {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    account_type: string;
    employee_id: string | null;
    student_id: string | null;
    status: number;
    roles: string[];
    profile?: {
      id: number;
      user_id: string;
      avatar: string | null;
      preferred_language?: string | null;
      timezone?: string | null;
    };
  };
}

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      // HQNhat expects { username, password } (not email)
      const username = credentials.email.includes('@')
        ? credentials.email.split('@')[0]
        : credentials.email;

      // Backend (Laravel) của hệ thống chỉ parse được form-urlencoded
      // cho các route POST trong IAM. Gửi form-urlencoded để API nhận diện
      // đúng field username/password (tránh lỗi "field is required").
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', credentials.password);

      const response = await hqnhatApi.post<{
        success: boolean;
        message: string;
        data: HqnhatLoginData;
      }>('/api/v1/iam/login', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Mirror into LoginResponse shape that Login.tsx / authStore expects
      const inner = response.data?.data;
      const token = inner?.access_token;
      const user = inner?.user;
      if (!token || !user) {
        throw new Error(response.data?.message || 'Phản hồi đăng nhập không hợp lệ');
      }

      // Map HQNhat role → UMS role
      const hqnhatRole = user.roles?.[0] || 'nhan_vien';
      const umsRole: Role = HQNHAT_ROLE_TO_UMS[hqnhatRole] || ROLES.NHAN_VIEN;

      return {
        success: true,
        message: response.data?.message || 'Login successful',
        accessToken: token,
        refreshToken: '',
        user: {
          id: String(user.id),
          email: user.email,
          username: user.username,
          name: user.username,
          displayName: user.username,
          role: umsRole,
          // Giữ raw roles từ HQNhat để sync sang hqnhatAuthStore
          // (một số UMS role map != HQNhat role ở dạng admin)
          roles: Array.isArray(user.roles) ? user.roles : [hqnhatRole],
          permissions: ['*'],
          department: user.employee_id || user.student_id || '',
          title: hqnhatRole,
          phone: user.phone ?? null,
          status: user.status === 1 ? 'active' : 'inactive',
          mfaEnabled: false,
          avatar: user.profile?.avatar ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      } as unknown as LoginResponse;
    },
    onSuccess: (data) => {
      const store = useAuthStore.getState();

      if (data.user && data.accessToken) {
        const userId = String(data.user.id ?? data.user._id ?? '');
        const phone = data.user.phone ?? undefined;
        const createdAt = data.user.createdAt ?? new Date().toISOString();
        const updatedAt = data.user.updatedAt ?? new Date().toISOString();
        store.login(
          {
            id: userId,
            email: data.user.email,
            name: data.user.displayName || data.user.name || data.user.email,
            username: data.user.username || data.user.email.split('@')[0],
            displayName: data.user.displayName || data.user.name || data.user.email,
            role: data.user.role,
            permissions: data.user.permissions || [],
            department: typeof data.user.department === 'object' && data.user.department !== null
              ? ((data.user.department as { _id?: string })._id ?? '')
              : (data.user.department ?? ''),
            title: data.user.title,
            phone,
            status: data.user.status || 'active',
            mfaEnabled: data.user.mfaEnabled || false,
            avatar: data.user.avatar || undefined,
            createdAt,
            updatedAt,
          },
          data.accessToken,
          data.refreshToken || ''
        );

        // ─── Sync HQNhat auth store ─────────────────────────────────────
        // useLogin thực chất đã gọi HQNhat /api/v1/iam/login, lưu token +
        // raw roles vào hqnhatAuthStore để các trang IAM (HqnhatAuthBanner)
        // biết được trạng thái kết nối + role để phân quyền truy cập.
        try {
          useHqnhatAuthStore.getState().setCredentials(
            data.accessToken,
            data.user.username || data.user.email,
            Array.isArray(data.user.roles) ? data.user.roles : []
          );
        } catch {
          // ignore — không ảnh hưởng login flow chính
        }

        // Navigate to dashboard
        const dashboard = ROLE_DASHBOARD_MAP[data.user.role] || '/dashboard';
        window.location.href = dashboard;
      }
    },
    onError: (error: unknown) => {
      // Error is already handled in the component
      console.error('Login error:', error);
      throw error;
    },
  });
};

export const useVerifyMfa = () => {
  return useMutation({
    mutationFn: async (_args: { tempToken: string; code: string }): Promise<LoginResponse> => {
      // MFA verify endpoint not exposed in HQNhat IAM client.
      throw new Error('MFA verify is not supported in this build');
    },
    onSuccess: (data) => {
      const store = useAuthStore.getState();

      if (data.user && data.accessToken) {
        const userId = String(data.user.id ?? data.user._id ?? '');
        const phone = data.user.phone ?? undefined;
        const createdAt = data.user.createdAt ?? new Date().toISOString();
        const updatedAt = data.user.updatedAt ?? new Date().toISOString();
        store.completeMfaLogin(
          {
            id: userId,
            email: data.user.email,
            name: data.user.displayName || data.user.name || data.user.email,
            username: data.user.username || data.user.email.split('@')[0],
            displayName: data.user.displayName || data.user.name || data.user.email,
            role: data.user.role,
            permissions: data.user.permissions || [],
            department: typeof data.user.department === 'object' && data.user.department !== null
              ? ((data.user.department as { _id?: string })._id ?? '')
              : (data.user.department ?? ''),
            title: data.user.title,
            phone,
            status: data.user.status || 'active',
            mfaEnabled: true,
            avatar: data.user.avatar || undefined,
            createdAt,
            updatedAt,
          },
          data.accessToken,
          data.refreshToken || ''
        );

        const dashboard = ROLE_DASHBOARD_MAP[data.user.role] || '/dashboard';
        window.location.href = dashboard;
      }
    },
    onError: (error: unknown) => {
      console.error('MFA verify error:', error);
      throw error;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      // No remote logout endpoint for HQNhat in this client
      // Token cleanup happens client-side via authStore
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
      // Skip remote fetch in this client (no /auth/me in HQNhat path)
      return { data: useAuthStore.getState().user };
    },
    onSuccess: (data) => {
      useAuthStore.getState().updateUser(data.data as any);
    },
  });
};

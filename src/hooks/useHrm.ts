// TanStack Query Hooks for HRM Module
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ApiResponse, PaginatedResponse, VienChucFilters, Department, LeaveRequest } from '@/types/api.types';

// ─── VienChuc Hooks ──────────────────────────────────────────────────────────

export const useVienChucList = (filters: VienChucFilters = {}) => {
  return useQuery({
    queryKey: ['vienChuc', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<any>>('/hrm/vien-chuc', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (prev) => prev,
  });
};

export const useVienChucDetail = (id: string) => {
  return useQuery({
    queryKey: ['vienChuc', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/hrm/vien-chuc/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useVienChucStats = () => {
  return useQuery({
    queryKey: ['vienChuc', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/hrm/vien-chuc-stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<ApiResponse<any>>('/hrm/vien-chuc', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm viên chức mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thất bại',
      });
    },
  });
};

export const useUpdateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch<ApiResponse<any>>(`/hrm/vien-chuc/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật thông tin',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cập nhật thất bại',
      });
    },
  });
};

export const useDeleteVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/hrm/vien-chuc/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa viên chức',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa thất bại',
      });
    },
  });
};

// ─── Department Hooks ────────────────────────────────────────────────────────

export const useDepartmentList = (options?: { type?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: ['departments', options],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Department[]>>('/hrm/departments', {
        params: options,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - rarely changes
  });
};

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: Partial<Department>) => {
      const response = await api.post<ApiResponse<Department>>('/hrm/departments', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm đơn vị mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thất bại',
      });
    },
  });
};

// ─── Leave Request Hooks ────────────────────────────────────────────────────

export const useLeaveRequestList = (filters?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery({
    queryKey: ['leaveRequests', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<LeaveRequest>>('/hrm/leave-requests', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateLeaveRequest = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: Partial<LeaveRequest>) => {
      const response = await api.post<ApiResponse<LeaveRequest>>('/hrm/leave-requests', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã gửi đơn nghỉ phép',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi đơn thất bại',
      });
    },
  });
};

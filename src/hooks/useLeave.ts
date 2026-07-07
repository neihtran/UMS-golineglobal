/**
 * useLeave — TanStack Query hooks for Leave Request module.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '@/services/leave.service';
import type { LeaveRequest, LeaveFilters } from '@/services/leave.service';
import { useNotificationStore } from '@/stores/notificationStore';

export const useLeaveList = (filters: LeaveFilters = {}) =>
  useQuery({
    queryKey: ['leave', 'list', filters],
    queryFn: () => leaveService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

export const useLeaveStats = () =>
  useQuery({
    queryKey: ['leave', 'stats'],
    queryFn: () => leaveService.stats().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateLeave = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: leaveService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi đơn xin nghỉ phép' });
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

export const useApproveLeave = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: leaveService.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      addNotification({ type: 'success', title: 'Thành công', message: '�ã phê duyệt đơn nghỉ phép' });
    },
  });
};

export const useRejectLeave = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => leaveService.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      addNotification({ type: 'warning', title: 'Đã từ chối', message: 'Đơn nghỉ phép đã bị từ chối' });
    },
  });
};

export const useDeleteLeave = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: leaveService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy đơn nghỉ phép' });
    },
  });
};

export const useUpdateLeave = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveRequest> }) =>
      leaveService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đơn nghỉ phép' });
    },
  });
};

export const useLeaveBalance = (employeeId: string) =>
  useQuery({
    queryKey: ['leave', 'balance', employeeId],
    queryFn: () => leaveService.getLeaveBalance(employeeId).then((r) => r.data.data),
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
  });

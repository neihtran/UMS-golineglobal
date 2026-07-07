/**
 * useInt — TanStack Query hooks for INT (Integration) module.
 * Provides hooks for integrations and integration logs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  integrationService,
  integrationLogService,
} from '@/services/int.service';
import type {
  IntegrationFilters,
  Integration,
  IntegrationLogFilters,
} from '@/services/int.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Integrations ────────────────────────────────────────────────────────────────

export const useIntegrationList = (filters: IntegrationFilters) =>
  useQuery({
    queryKey: ['int', 'integrations', 'list', filters],
    queryFn: () => integrationService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useIntegrationDetail = (id: string) =>
  useQuery({
    queryKey: ['int', 'integrations', id],
    queryFn: () => integrationService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo tích hợp mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo tích hợp thất bại',
      });
    },
  });
};

export const useUpdateIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Integration> }) =>
      integrationService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      qc.setQueryData(['int', 'integrations', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật tích hợp' });
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

export const useDeleteIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa tích hợp' });
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

export const useActivateIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.activate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      qc.setQueryData(['int', 'integrations', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã kích hoạt tích hợp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Kích hoạt thất bại',
      });
    },
  });
};

export const useDeactivateIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.deactivate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      qc.setQueryData(['int', 'integrations', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã vô hiệu hóa tích hợp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Vô hiệu hóa thất bại',
      });
    },
  });
};

export const useTestIntegration = () => {
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.test,
    onSuccess: (result) => {
      if (result.data?.success) {
        addNotification({ type: 'success', title: 'Kết nối thành công', message: result.data.message });
      } else {
        addNotification({ type: 'error', title: 'Kết nối thất bại', message: result.data?.message });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Kiểm tra kết nối thất bại',
      });
    },
  });
};

export const useSyncIntegration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationService.sync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đồng bộ dữ liệu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đồng bộ thất bại',
      });
    },
  });
};

export const useGetIntegrationCredentials = (id: string) =>
  useQuery({
    queryKey: ['int', 'integrations', id, 'credentials'],
    queryFn: () => integrationService.getCredentials(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateIntegrationCredentials = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, credentials }: { id: string; credentials: Record<string, string> }) =>
      integrationService.updateCredentials(id, credentials),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['int', 'integrations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thông tin đăng nhập' });
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

// ─── Integration Logs ────────────────────────────────────────────────────────────

export const useIntegrationLogList = (filters: IntegrationLogFilters) =>
  useQuery({
    queryKey: ['int', 'logs', 'list', filters],
    queryFn: () => integrationLogService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useIntegrationLogDetail = (id: string) =>
  useQuery({
    queryKey: ['int', 'logs', id],
    queryFn: () => integrationLogService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useIntegrationLogsByIntegration = (integrationId: string, filters?: Partial<IntegrationLogFilters>) =>
  useQuery({
    queryKey: ['int', 'logs', 'by-integration', integrationId, filters],
    queryFn: () => integrationLogService.getByIntegration(integrationId, filters).then((r) => r.data),
    enabled: !!integrationId,
    staleTime: 1000 * 60 * 2,
  });

export const useClearIntegrationLogs = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ integrationId, olderThanDays }: { integrationId: string; olderThanDays?: number }) =>
      integrationLogService.clear(integrationId, olderThanDays),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['int', 'logs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa log cũ' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa log thất bại',
      });
    },
  });
};

export const useExportIntegrationLogs = () => {
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: integrationLogService.export,
    onSuccess: (result) => {
      const url = (result.data as { data: string }).data;
      if (url) {
        window.open(url, '_blank');
      }
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xuất log thất bại',
      });
    },
  });
};

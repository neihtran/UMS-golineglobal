/**
 * useBi — TanStack Query hooks for BI (Business Intelligence) module.
 * Provides hooks for reports and report schedules.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reportService,
  reportScheduleService,
} from '@/services/bi.service';
import type {
  ReportFilters,
  Report,
  ReportScheduleFilters,
  ReportSchedule,
} from '@/services/bi.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Reports ────────────────────────────────────────────────────────────────────

export const useReportList = (filters: ReportFilters) =>
  useQuery({
    queryKey: ['bi', 'reports', 'list', filters],
    queryFn: () => reportService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useReportDetail = (id: string) =>
  useQuery({
    queryKey: ['bi', 'reports', id],
    queryFn: () => reportService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useReportLastRun = (id: string) =>
  useQuery({
    queryKey: ['bi', 'reports', id, 'last-run'],
    queryFn: () => reportService.getLastRun(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo báo cáo mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo báo cáo thất bại',
      });
    },
  });
};

export const useUpdateReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Report> }) => reportService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
      qc.setQueryData(['bi', 'reports', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật báo cáo' });
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

export const useDeleteReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa báo cáo' });
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

export const useRunReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params?: Record<string, unknown> }) =>
      reportService.run(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chạy báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chạy báo cáo thất bại',
      });
    },
  });
};

export const useFavoriteReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportService.favorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
    },
    onError: (error: any) => {
      console.error('Favorite error:', error?.response?.data?.error?.message);
    },
  });
};

export const useUnfavoriteReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportService.unfavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
    },
    onError: (error: any) => {
      console.error('Unfavorite error:', error?.response?.data?.error?.message);
    },
  });
};

export const useExportReport = () => {
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, format, params }: { id: string; format: 'pdf' | 'excel' | 'csv'; params?: Record<string, unknown> }) =>
      reportService.export(id, format, params),
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
        message: error?.response?.data?.error?.message || 'Xuất báo cáo thất bại',
      });
    },
  });
};

export const useDuplicateReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportService.duplicate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'reports'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nhân bản báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nhân bản thất bại',
      });
    },
  });
};

// ─── Report Schedules ───────────────────────────────────────────────────────────

export const useReportScheduleList = (filters: ReportScheduleFilters) =>
  useQuery({
    queryKey: ['bi', 'report-schedules', 'list', filters],
    queryFn: () => reportScheduleService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useReportScheduleDetail = (id: string) =>
  useQuery({
    queryKey: ['bi', 'report-schedules', id],
    queryFn: () => reportScheduleService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useReportScheduleHistory = (id: string) =>
  useQuery({
    queryKey: ['bi', 'report-schedules', id, 'history'],
    queryFn: () => reportScheduleService.getHistory(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportScheduleService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo lịch báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo lịch báo cáo thất bại',
      });
    },
  });
};

export const useUpdateReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportSchedule> }) =>
      reportScheduleService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      qc.setQueryData(['bi', 'report-schedules', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật lịch báo cáo' });
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

export const useDeleteReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportScheduleService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa lịch báo cáo' });
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

export const usePauseReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportScheduleService.pause,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      qc.setQueryData(['bi', 'report-schedules', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạm dừng lịch báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạm dừng thất bại',
      });
    },
  });
};

export const useResumeReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportScheduleService.resume,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      qc.setQueryData(['bi', 'report-schedules', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tiếp tục lịch báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tiếp tục thất bại',
      });
    },
  });
};

export const useRunNowReportSchedule = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: reportScheduleService.runNow,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bi', 'report-schedules'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chạy báo cáo ngay' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chạy báo cáo thất bại',
      });
    },
  });
};

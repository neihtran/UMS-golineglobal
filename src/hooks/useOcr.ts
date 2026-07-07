/**
 * useOcr — TanStack Query hooks for OCR (Document Digitization) module.
 * Provides hooks for OCR jobs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ocrJobService } from '@/services/ocr.service';
import type {
  OCRJobFilters,
} from '@/services/ocr.service';
import { useNotificationStore } from '@/stores/notificationStore';

export const useOcrJobList = (filters: OCRJobFilters) =>
  useQuery({
    queryKey: ['ocr', 'jobs', 'list', filters],
    queryFn: () => ocrJobService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useOcrJobDetail = (id: string) =>
  useQuery({
    queryKey: ['ocr', 'jobs', id],
    queryFn: () => ocrJobService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateOcrJob = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ocrJobService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocr', 'jobs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo công việc OCR' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo công việc thất bại',
      });
    },
  });
};

export const useSubmitOcrJob = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) =>
      ocrJobService.submit(file, documentType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocr', 'jobs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi file OCR thành công' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi file thất bại',
      });
    },
  });
};

export const useReprocessOcrJob = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ocrJobService.reprocess,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['ocr', 'jobs'] });
      qc.setQueryData(['ocr', 'jobs', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã yêu cầu xử lý lại' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xử lý lại thất bại',
      });
    },
  });
};

export const useDeleteOcrJob = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ocrJobService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ocr', 'jobs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa công việc OCR' });
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

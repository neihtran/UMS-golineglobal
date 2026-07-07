/**
 * useFin — TanStack Query hooks for FIN (Finance & Accounting) module.
 * Provides hooks for tuition, expenditures, and tuition invoices.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tuitionService,
  expenditureService,
  tuitionInvoiceService,
} from '@/services/fin.service';
import type {
  TuitionFilters,
  Tuition,
  ExpenditureFilters,
  Expenditure,
  TuitionInvoiceFilters,
} from '@/services/fin.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Tuition ─────────────────────────────────────────────────────────────────────

export const useTuitionList = (filters: TuitionFilters) =>
  useQuery({
    queryKey: ['fin', 'tuition', 'list', filters],
    queryFn: () => tuitionService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useTuitionDetail = (id: string) =>
  useQuery({
    queryKey: ['fin', 'tuition', id],
    queryFn: () => tuitionService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useStudentTuition = (studentId: string, academicYear?: string) =>
  useQuery({
    queryKey: ['fin', 'tuition', 'student', studentId, academicYear],
    queryFn: () => tuitionService.getStudentTuition(studentId, academicYear).then((r) => r.data.data),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateTuition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: tuitionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo học phí mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo học phí thất bại',
      });
    },
  });
};

export const useUpdateTuition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tuition> }) => tuitionService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      qc.setQueryData(['fin', 'tuition', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật học phí' });
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

export const useDeleteTuition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: tuitionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa học phí' });
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

export const useRecordTuitionPayment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, amount, method, note }: { id: string; amount: number; method: string; note?: string }) =>
      tuitionService.recordPayment(id, { amount, method, note }),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      qc.setQueryData(['fin', 'tuition', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi nhận thanh toán' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi nhận thất bại',
      });
    },
  });
};

export const useWaiveTuition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      tuitionService.waive(id, { amount, reason }),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      qc.setQueryData(['fin', 'tuition', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã miễn giảm học phí' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Miễn giảm thất bại',
      });
    },
  });
};

export const useExemptTuition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => tuitionService.exempt(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition'] });
      qc.setQueryData(['fin', 'tuition', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã miễn học phí' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Miễn học phí thất bại',
      });
    },
  });
};

// ─── Expenditures ───────────────────────────────────────────────────────────────

export const useExpenditureList = (filters: ExpenditureFilters) =>
  useQuery({
    queryKey: ['fin', 'expenditures', 'list', filters],
    queryFn: () => expenditureService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useExpenditureDetail = (id: string) =>
  useQuery({
    queryKey: ['fin', 'expenditures', id],
    queryFn: () => expenditureService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateExpenditure = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: expenditureService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo phiếu chi mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo phiếu chi thất bại',
      });
    },
  });
};

export const useUpdateExpenditure = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expenditure> }) =>
      expenditureService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      qc.setQueryData(['fin', 'expenditures', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật phiếu chi' });
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

export const useDeleteExpenditure = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: expenditureService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa phiếu chi' });
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

export const useApproveExpenditure = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      expenditureService.approve(id),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      qc.setQueryData(['fin', 'expenditures', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt phiếu chi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Phê duyệt thất bại',
      });
    },
  });
};

export const useRejectExpenditure = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      expenditureService.reject(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      qc.setQueryData(['fin', 'expenditures', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã từ chối phiếu chi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Từ chối thất bại',
      });
    },
  });
};

export const useProcessExpenditurePayment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: { method: string; reference?: string; date?: string } }) =>
      expenditureService.processPayment(id, paymentData),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'expenditures'] });
      qc.setQueryData(['fin', 'expenditures', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thanh toán phiếu chi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thanh toán thất bại',
      });
    },
  });
};

// ─── Tuition Invoices ───────────────────────────────────────────────────────────

export const useTuitionInvoiceList = (filters: TuitionInvoiceFilters) =>
  useQuery({
    queryKey: ['fin', 'tuition-invoices', 'list', filters],
    queryFn: () => tuitionInvoiceService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useTuitionInvoiceDetail = (id: string) =>
  useQuery({
    queryKey: ['fin', 'tuition-invoices', id],
    queryFn: () => tuitionInvoiceService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateTuitionInvoice = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: tuitionInvoiceService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition-invoices'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo hóa đơn học phí' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo hóa đơn thất bại',
      });
    },
  });
};

export const useCancelTuitionInvoice = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tuitionInvoiceService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition-invoices'] });
      qc.setQueryData(['fin', 'tuition-invoices', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy hóa đơn' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy hóa đơn thất bại',
      });
    },
  });
};

export const useRefundTuitionInvoice = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      tuitionInvoiceService.refund(id, { amount, reason }),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['fin', 'tuition-invoices'] });
      qc.setQueryData(['fin', 'tuition-invoices', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hoàn tiền hóa đơn' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hoàn tiền thất bại',
      });
    },
  });
};

export const useDownloadTuitionInvoice = () => {
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: tuitionInvoiceService.download,
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
        message: error?.response?.data?.error?.message || 'Tải hóa đơn thất bại',
      });
    },
  });
};

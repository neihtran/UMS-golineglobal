/**
 * useDms — TanStack Query hooks for DMS (Document Management) module.
 * Provides hooks for documents, categories, and approval flows.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentService,
  categoryService,
  approvalFlowService,
} from '@/services/dms.service';
import type {
  DocumentFilters,
  Document,
  CategoryFilters,
  Category,
  ApprovalFlowFilters,
  ApprovalFlow,
} from '@/services/dms.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Documents ──────────────────────────────────────────────────────────────────

export const useDocumentList = (filters: DocumentFilters) =>
  useQuery({
    queryKey: ['dms', 'documents', 'list', filters],
    queryFn: () => documentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useDocumentDetail = (id: string) =>
  useQuery({
    queryKey: ['dms', 'documents', id],
    queryFn: () => documentService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo văn bản mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo văn bản thất bại',
      });
    },
  });
};

export const useUpdateDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) => documentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật văn bản' });
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

export const useDeleteDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa văn bản' });
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

export const useSubmitDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.submit,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã trình ký văn bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Trình ký thất bại',
      });
    },
  });
};

export const useApproveDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => documentService.approve(id, comment),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt văn bản' });
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

export const useRejectDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => documentService.reject(id, comment),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã từ chối văn bản' });
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

export const useSignDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.sign,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ký văn bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ký thất bại',
      });
    },
  });
};

export const usePublishDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.publish,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ban hành văn bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ban hành thất bại',
      });
    },
  });
};

export const useArchiveDocument = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: documentService.archive,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dms', 'documents'] });
      qc.setQueryData(['dms', 'documents', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã lưu trữ văn bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Lưu trữ thất bại',
      });
    },
  });
};

// ─── Categories ──────────────────────────────────────────────────────────────────

export const useCategoryList = (filters: CategoryFilters) =>
  useQuery({
    queryKey: ['dms', 'categories', 'list', filters],
    queryFn: () => categoryService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useCategoryDetail = (id: string) =>
  useQuery({
    queryKey: ['dms', 'categories', id],
    queryFn: () => categoryService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'categories'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm loại văn bản' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo loại văn bản thất bại',
      });
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categoryService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dms', 'categories'] });
      qc.setQueryData(['dms', 'categories', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật loại văn bản' });
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

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'categories'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa loại văn bản' });
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

// ─── Approval Flows ──────────────────────────────────────────────────────────────

export const useApprovalFlowList = (filters: ApprovalFlowFilters) =>
  useQuery({
    queryKey: ['dms', 'approval-flows', 'list', filters],
    queryFn: () => approvalFlowService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useApprovalFlowDetail = (id: string) =>
  useQuery({
    queryKey: ['dms', 'approval-flows', id],
    queryFn: () => approvalFlowService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateApprovalFlow = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: approvalFlowService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'approval-flows'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo quy trình phê duyệt' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo quy trình thất bại',
      });
    },
  });
};

export const useUpdateApprovalFlow = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApprovalFlow> }) =>
      approvalFlowService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dms', 'approval-flows'] });
      qc.setQueryData(['dms', 'approval-flows', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật quy trình phê duyệt' });
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

export const useDeleteApprovalFlow = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: approvalFlowService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dms', 'approval-flows'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa quy trình phê duyệt' });
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

/**
 * useRit — TanStack Query hooks for RIT (Research & International Cooperation) module.
 * Provides hooks for research projects, publications, and patents.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  researchProjectService,
  publicationService,
  patentService,
} from '@/services/rit.service';
import type {
  ResearchProjectFilters,
  ResearchProject,
  PublicationFilters,
  Publication,
  PatentFilters,
  Patent,
} from '@/services/rit.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Research Projects ──────────────────────────────────────────────────────────

export const useResearchProjectList = (filters: ResearchProjectFilters) =>
  useQuery({
    queryKey: ['rit', 'research-projects', 'list', filters],
    queryFn: () => researchProjectService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useResearchProjectDetail = (id: string) =>
  useQuery({
    queryKey: ['rit', 'research-projects', id],
    queryFn: () => researchProjectService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: researchProjectService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đề tài nghiên cứu' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo đề tài thất bại',
      });
    },
  });
};

export const useUpdateResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResearchProject> }) =>
      researchProjectService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      qc.setQueryData(['rit', 'research-projects', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đề tài nghiên cứu' });
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

export const useDeleteResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: researchProjectService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa đề tài nghiên cứu' });
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

export const useApproveResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: researchProjectService.approve,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      qc.setQueryData(['rit', 'research-projects', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt đề tài' });
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

export const useSuspendResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      researchProjectService.suspend(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      qc.setQueryData(['rit', 'research-projects', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạm dừng đề tài' });
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

export const useCompleteResearchProject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: researchProjectService.complete,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      qc.setQueryData(['rit', 'research-projects', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hoàn thành đề tài' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hoàn thành thất bại',
      });
    },
  });
};

export const useSubmitResearchReport = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reportData }: { id: string; reportData: any }) =>
      researchProjectService.submitReport(id, reportData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'research-projects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nộp báo cáo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nộp báo cáo thất bại',
      });
    },
  });
};

// ─── Publications ───────────────────────────────────────────────────────────────

export const usePublicationList = (filters: PublicationFilters) =>
  useQuery({
    queryKey: ['rit', 'publications', 'list', filters],
    queryFn: () => publicationService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const usePublicationDetail = (id: string) =>
  useQuery({
    queryKey: ['rit', 'publications', id],
    queryFn: () => publicationService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreatePublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publicationService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm công trình' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm công trình thất bại',
      });
    },
  });
};

export const useUpdatePublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Publication> }) =>
      publicationService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      qc.setQueryData(['rit', 'publications', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật công trình' });
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

export const useDeletePublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publicationService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa công trình' });
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

export const useSubmitPublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publicationService.submit,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      qc.setQueryData(['rit', 'publications', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi công trình' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi công trình thất bại',
      });
    },
  });
};

export const useAcceptPublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: publicationService.accept,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      qc.setQueryData(['rit', 'publications', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chấp nhận công trình' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chấp nhận thất bại',
      });
    },
  });
};

export const useRejectPublication = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      publicationService.reject(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'publications'] });
      qc.setQueryData(['rit', 'publications', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã từ chối công trình' });
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

// ─── Patents ────────────────────────────────────────────────────────────────────

export const usePatentList = (filters: PatentFilters) =>
  useQuery({
    queryKey: ['rit', 'patents', 'list', filters],
    queryFn: () => patentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const usePatentDetail = (id: string) =>
  useQuery({
    queryKey: ['rit', 'patents', id],
    queryFn: () => patentService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreatePatent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: patentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'patents'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm bằng sáng chế' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm bằng sáng chế thất bại',
      });
    },
  });
};

export const useUpdatePatent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patent> }) => patentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'patents'] });
      qc.setQueryData(['rit', 'patents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật bằng sáng chế' });
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

export const useDeletePatent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: patentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rit', 'patents'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa bằng sáng chế' });
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

export const useFilePatent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, filingData }: { id: string; filingData: { applicationNumber: string; filingDate: string; jurisdiction: string } }) =>
      patentService.file(id, filingData),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'patents'] });
      qc.setQueryData(['rit', 'patents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nộp đơn sáng chế' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nộp đơn thất bại',
      });
    },
  });
};

export const useGrantPatent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, grantData }: { id: string; grantData: { grantDate: string; patentNumber: string; expiryDate: string } }) =>
      patentService.grant(id, grantData),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['rit', 'patents'] });
      qc.setQueryData(['rit', 'patents', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cấp bằng sáng chế' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Cấp bằng thất bại',
      });
    },
  });
};

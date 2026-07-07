/**
 * useQa — TanStack Query hooks for QA (Quality Assurance) module.
 * Provides hooks for standards, evidences, assessments, and complaints.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  standardService,
  evidenceService,
  assessmentService,
  complaintService,
  assetService,
} from '@/services/qa.service';
import type {
  StandardFilters,
  Standard,
  EvidenceFilters,
  Evidence,
  AssessmentFilters,
  Assessment,
  ComplaintFilters,
  Complaint,
  QaAssetFilters,
} from '@/services/qa.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Standards ──────────────────────────────────────────────────────────────────

export const useStandardList = (filters: StandardFilters) =>
  useQuery({
    queryKey: ['qa', 'standards', 'list', filters],
    queryFn: () => standardService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useStandardDetail = (id: string) =>
  useQuery({
    queryKey: ['qa', 'standards', id],
    queryFn: () => standardService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateStandard = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: standardService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'standards'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo tiêu chuẩn mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo tiêu chuẩn thất bại',
      });
    },
  });
};

export const useUpdateStandard = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Standard> }) => standardService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'standards'] });
      qc.setQueryData(['qa', 'standards', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật tiêu chuẩn' });
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

export const useDeleteStandard = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: standardService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'standards'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa tiêu chuẩn' });
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

export const useActivateStandard = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: standardService.activate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'standards'] });
      qc.setQueryData(['qa', 'standards', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã kích hoạt tiêu chuẩn' });
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

export const useDeactivateStandard = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: standardService.deactivate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'standards'] });
      qc.setQueryData(['qa', 'standards', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã vô hiệu hóa tiêu chuẩn' });
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

// ─── Evidences ──────────────────────────────────────────────────────────────────

export const useEvidenceList = (filters: EvidenceFilters) =>
  useQuery({
    queryKey: ['qa', 'evidences', 'list', filters],
    queryFn: () => evidenceService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useEvidenceDetail = (id: string) =>
  useQuery({
    queryKey: ['qa', 'evidences', id],
    queryFn: () => evidenceService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: evidenceService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm bằng chứng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm bằng chứng thất bại',
      });
    },
  });
};

export const useUpdateEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Evidence> }) =>
      evidenceService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      qc.setQueryData(['qa', 'evidences', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật bằng chứng' });
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

export const useDeleteEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: evidenceService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa bằng chứng' });
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

export const useUploadEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: evidenceService.upload,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tải lên bằng chứng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tải lên thất bại',
      });
    },
  });
};

export const useApproveEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      evidenceService.approve(id, comment),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      qc.setQueryData(['qa', 'evidences', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt bằng chứng' });
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

export const useRejectEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      evidenceService.reject(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      qc.setQueryData(['qa', 'evidences', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã từ chối bằng chứng' });
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

export const useSubmitEvidence = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: evidenceService.submit,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'evidences'] });
      qc.setQueryData(['qa', 'evidences', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi bằng chứng' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi bằng chứng thất bại',
      });
    },
  });
};

// ─── Assessments ────────────────────────────────────────────────────────────────

export const useAssessmentList = (filters: AssessmentFilters) =>
  useQuery({
    queryKey: ['qa', 'assessments', 'list', filters],
    queryFn: () => assessmentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAssessmentDetail = (id: string) =>
  useQuery({
    queryKey: ['qa', 'assessments', id],
    queryFn: () => assessmentService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useAssessmentSummary = (standardId: string) =>
  useQuery({
    queryKey: ['qa', 'assessments', 'summary', standardId],
    queryFn: () => assessmentService.getSummary(standardId).then((r) => r.data),
    enabled: !!standardId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assessmentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đánh giá' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo đánh giá thất bại',
      });
    },
  });
};

export const useUpdateAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Assessment> }) =>
      assessmentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      qc.setQueryData(['qa', 'assessments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đánh giá' });
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

export const useDeleteAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assessmentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa đánh giá' });
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

export const useSubmitAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assessmentService.submit,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      qc.setQueryData(['qa', 'assessments', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi đánh giá' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi đánh giá thất bại',
      });
    },
  });
};

export const useReviewAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { result: 'approved' | 'rejected'; comment?: string } }) =>
      assessmentService.review(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      qc.setQueryData(['qa', 'assessments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phản hồi đánh giá' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Phản hồi thất bại',
      });
    },
  });
};

export const useApproveAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: assessmentService.approve,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'assessments'] });
      qc.setQueryData(['qa', 'assessments', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phê duyệt đánh giá' });
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

// ─── Complaints ─────────────────────────────────────────────────────────────────

export const useComplaintList = (filters: ComplaintFilters) =>
  useQuery({
    queryKey: ['qa', 'complaints', 'list', filters],
    queryFn: () => complaintService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useComplaintDetail = (id: string) =>
  useQuery({
    queryKey: ['qa', 'complaints', id],
    queryFn: () => complaintService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: complaintService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi khiếu nại' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi khiếu nại thất bại',
      });
    },
  });
};

export const useUpdateComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Complaint> }) =>
      complaintService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật khiếu nại' });
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

export const useAssignComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      complaintService.assign(id, assignedTo),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phân công xử lý' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Phân công thất bại',
      });
    },
  });
};

export const useInvestigateComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: complaintService.investigate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tiến hành điều tra' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Điều tra thất bại',
      });
    },
  });
};

export const useRespondComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      complaintService.respond(id, response),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phản hồi khiếu nại' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Phản hồi thất bại',
      });
    },
  });
};

export const useResolveComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      complaintService.resolve(id, resolution),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã giải quyết khiếu nại' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Giải quyết thất bại',
      });
    },
  });
};

export const useCloseComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: complaintService.close,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đóng khiếu nại' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đóng khiếu nại thất bại',
      });
    },
  });
};

export const useEscalateComplaint = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      complaintService.escalate(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chuyển khiếu nại lên cấp cao hơn' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chuyển cấp thất bại',
      });
    },
  });
};

export const useRateComplaintSatisfaction = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      complaintService.rateSatisfaction(id, rating),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['qa', 'complaints'] });
      qc.setQueryData(['qa', 'complaints', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Cảm ơn bạn đã đánh giá' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Đánh giá thất bại',
      });
    },
  });
};

// ─── Assets ──────────────────────────────────────────────────────────────────

export const useAssetList = (filters: QaAssetFilters) =>
  useQuery({
    queryKey: ['qa', 'assets', 'list', filters],
    queryFn: () => assetService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useAssetDetail = (id: string) =>
  useQuery({
    queryKey: ['qa', 'assets', id],
    queryFn: () => assetService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

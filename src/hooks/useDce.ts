/**
 * useDce — TanStack Query hooks for DCE (Digital Competency & Education) module.
 * Provides hooks for competencies, competency assessments, and training programs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  competencyService,
  competencyAssessmentService,
  trainingProgramService,
} from '@/services/dce.service';
import type {
  CompetencyFilters,
  Competency,
  CompetencyAssessmentFilters,
  CompetencyAssessment,
  TrainingProgramFilters,
  TrainingProgram,
} from '@/services/dce.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Competencies ───────────────────────────────────────────────────────────────

export const useCompetencyList = (filters: CompetencyFilters) =>
  useQuery({
    queryKey: ['dce', 'competencies', 'list', filters],
    queryFn: () => competencyService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useCompetencyDetail = (id: string) =>
  useQuery({
    queryKey: ['dce', 'competencies', id],
    queryFn: () => competencyService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCompetency = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'competencies'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm năng lực mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm năng lực thất bại',
      });
    },
  });
};

export const useUpdateCompetency = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Competency> }) =>
      competencyService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competencies'] });
      qc.setQueryData(['dce', 'competencies', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật năng lực' });
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

export const useDeleteCompetency = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'competencies'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa năng lực' });
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

export const useActivateCompetency = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyService.activate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competencies'] });
      qc.setQueryData(['dce', 'competencies', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã kích hoạt năng lực' });
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

export const useDeactivateCompetency = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyService.deactivate,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competencies'] });
      qc.setQueryData(['dce', 'competencies', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã vô hiệu hóa năng lực' });
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

// ─── Competency Assessments ─────────────────────────────────────────────────────

export const useCompetencyAssessmentList = (filters: CompetencyAssessmentFilters) =>
  useQuery({
    queryKey: ['dce', 'competency-assessments', 'list', filters],
    queryFn: () => competencyAssessmentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useCompetencyAssessmentDetail = (id: string) =>
  useQuery({
    queryKey: ['dce', 'competency-assessments', id],
    queryFn: () => competencyAssessmentService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useStudentCompetencyPortfolio = (studentId: string) =>
  useQuery({
    queryKey: ['dce', 'competency-assessments', 'portfolio', studentId],
    queryFn: () => competencyAssessmentService.getStudentPortfolio(studentId).then((r) => r.data),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useStudentCompetencyProgress = (studentId: string, programId?: string) =>
  useQuery({
    queryKey: ['dce', 'competency-assessments', 'progress', studentId, programId],
    queryFn: () => competencyAssessmentService.getProgressReport(studentId, programId).then((r) => r.data),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyAssessmentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đánh giá năng lực' });
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

export const useUpdateCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompetencyAssessment> }) =>
      competencyAssessmentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      qc.setQueryData(['dce', 'competency-assessments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đánh giá năng lực' });
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

export const useDeleteCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyAssessmentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa đánh giá năng lực' });
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

export const useSubmitCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyAssessmentService.submit,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      qc.setQueryData(['dce', 'competency-assessments', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã gửi đánh giá năng lực' });
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

export const useReviewCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved: boolean; comment?: string } }) =>
      competencyAssessmentService.review(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      qc.setQueryData(['dce', 'competency-assessments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã phản hồi đánh giá năng lực' });
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

export const useCertifyCompetencyAssessment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: competencyAssessmentService.certify,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'competency-assessments'] });
      qc.setQueryData(['dce', 'competency-assessments', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chứng nhận năng lực' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chứng nhận thất bại',
      });
    },
  });
};

// ─── Training Programs ──────────────────────────────────────────────────────────

export const useTrainingProgramList = (filters: TrainingProgramFilters) =>
  useQuery({
    queryKey: ['dce', 'training-programs', 'list', filters],
    queryFn: () => trainingProgramService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useTrainingProgramDetail = (id: string) =>
  useQuery({
    queryKey: ['dce', 'training-programs', id],
    queryFn: () => trainingProgramService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useTrainingProgramParticipants = (id: string) =>
  useQuery({
    queryKey: ['dce', 'training-programs', id, 'participants'],
    queryFn: () => trainingProgramService.getParticipants(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useCreateTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo chương trình đào tạo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo chương trình thất bại',
      });
    },
  });
};

export const useUpdateTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingProgram> }) =>
      trainingProgramService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật chương trình đào tạo' });
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

export const useDeleteTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa chương trình đào tạo' });
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

export const useOpenTrainingProgramRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.openRegistration,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã mở đăng ký chương trình' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCloseTrainingProgramRegistration = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.closeRegistration,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đóng đăng ký chương trình' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useStartTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã bắt đầu chương trình đào tạo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCompleteTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: trainingProgramService.complete,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hoàn thành chương trình đào tạo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thao tác thất bại',
      });
    },
  });
};

export const useCancelTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trainingProgramService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      qc.setQueryData(['dce', 'training-programs', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy chương trình đào tạo' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy thất bại',
      });
    },
  });
};

export const useEnrollTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, participantId }: { id: string; participantId: string }) =>
      trainingProgramService.enroll(id, participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi danh tham gia' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi danh thất bại',
      });
    },
  });
};

export const useUnenrollTrainingProgram = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, participantId }: { id: string; participantId: string }) =>
      trainingProgramService.unenroll(id, participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dce', 'training-programs'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy ghi danh' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy ghi danh thất bại',
      });
    },
  });
};

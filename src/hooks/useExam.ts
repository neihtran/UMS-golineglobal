/**
 * useExam — TanStack Query hooks for EXAM module.
 * Provides hooks for exams, questions, exam sessions, and exam results.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  examService,
  questionService,
  examSessionService,
  examResultService,
} from '@/services/exam.service';
import type {
  ExamFilters,
  Exam,
  QuestionFilters,
  Question,
  ExamSessionFilters,
  ExamResultFilters,
} from '@/services/exam.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Exams ──────────────────────────────────────────────────────────────────────

export const useExamList = (filters: ExamFilters) =>
  useQuery({
    queryKey: ['exam', 'exams', 'list', filters],
    queryFn: () => examService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useExamDetail = (id: string) =>
  useQuery({
    queryKey: ['exam', 'exams', id],
    queryFn: () => examService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateExam = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam', 'exams'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đề thi mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo đề thi thất bại',
      });
    },
  });
};

export const useUpdateExam = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exam> }) => examService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'exams'] });
      qc.setQueryData(['exam', 'exams', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đề thi' });
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

export const useDeleteExam = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam', 'exams'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa đề thi' });
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

export const usePublishExam = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examService.publish,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['exam', 'exams'] });
      qc.setQueryData(['exam', 'exams', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã công bố đề thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Công bố thất bại',
      });
    },
  });
};

export const useArchiveExam = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examService.archive,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['exam', 'exams'] });
      qc.setQueryData(['exam', 'exams', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã lưu trữ đề thi' });
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

// ─── Questions ──────────────────────────────────────────────────────────────────

export const useQuestionList = (filters: QuestionFilters) =>
  useQuery({
    queryKey: ['exam', 'questions', 'list', filters],
    queryFn: () => questionService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useQuestionDetail = (id: string) =>
  useQuery({
    queryKey: ['exam', 'questions', id],
    queryFn: () => questionService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateQuestion = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: questionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam', 'questions'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm câu hỏi mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo câu hỏi thất bại',
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) =>
      questionService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'questions'] });
      qc.setQueryData(['exam', 'questions', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật câu hỏi' });
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

export const useDeleteQuestion = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: questionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam', 'questions'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa câu hỏi' });
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

export const useImportQuestions = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: questionService.import,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam', 'questions'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nhập câu hỏi thành công' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nhập câu hỏi thất bại',
      });
    },
  });
};

// ─── Exam Sessions ───────────────────────────────────────────────────────────────

export const useExamSessionList = (filters: ExamSessionFilters) =>
  useQuery({
    queryKey: ['exam', 'sessions', 'list', filters],
    queryFn: () => examSessionService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useExamSessionDetail = (id: string) =>
  useQuery({
    queryKey: ['exam', 'sessions', id],
    queryFn: () => examSessionService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useExamSessionAnswers = (id: string) =>
  useQuery({
    queryKey: ['exam', 'sessions', id, 'answers'],
    queryFn: () => examSessionService.getAnswers(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useStartExamSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examSessionService.start,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['exam', 'sessions'] });
      qc.setQueryData(['exam', 'sessions', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã bắt đầu thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Bắt đầu thi thất bại',
      });
    },
  });
};

export const useSubmitExamSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Record<string, unknown> }) =>
      examSessionService.submit(id, answers),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'sessions'] });
      qc.setQueryData(['exam', 'sessions', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã nộp bài thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Nộp bài thất bại',
      });
    },
  });
};

export const useGradeExamSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, score, feedback }: { id: string; score: number; feedback?: string }) =>
      examSessionService.grade(id, score, feedback),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'sessions'] });
      qc.setQueryData(['exam', 'sessions', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã chấm điểm' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Chấm điểm thất bại',
      });
    },
  });
};

export const useCancelExamSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      examSessionService.cancel(id, reason),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'sessions'] });
      qc.setQueryData(['exam', 'sessions', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy ca thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy ca thi thất bại',
      });
    },
  });
};

export const useReportExamCheating = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, flags }: { id: string; flags: string[] }) =>
      examSessionService.reportCheating(id, flags),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['exam', 'sessions'] });
      qc.setQueryData(['exam', 'sessions', vars.id], result.data);
      addNotification({ type: 'warning', title: 'Đã ghi nhận', message: 'Đã báo cáo gian lận thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Báo cáo thất bại',
      });
    },
  });
};

// ─── Exam Results ────────────────────────────────────────────────────────────────

export const useExamResultList = (filters: ExamResultFilters) =>
  useQuery({
    queryKey: ['exam', 'results', 'list', filters],
    queryFn: () => examResultService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useExamResultDetail = (id: string) =>
  useQuery({
    queryKey: ['exam', 'results', id],
    queryFn: () => examResultService.get(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const usePublishExamResult = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examResultService.publish,
    onSuccess: (result, id) => {
      qc.invalidateQueries({ queryKey: ['exam', 'results'] });
      qc.setQueryData(['exam', 'results', id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã công bố kết quả thi' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Công bố thất bại',
      });
    },
  });
};

export const useExportExamScores = () => {
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: examResultService.exportScores,
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
        message: error?.response?.data?.error?.message || 'Xuất điểm thất bại',
      });
    },
  });
};

export const useExamResultStatistics = (examId: string) =>
  useQuery({
    queryKey: ['exam', 'results', 'statistics', examId],
    queryFn: () => examResultService.getStatistics(examId).then((r) => r.data),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5,
  });

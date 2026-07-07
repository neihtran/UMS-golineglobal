/**
 * useSis — TanStack Query hooks for SIS (Student Information & Training) module.
 * Provides hooks for students, subjects, enrollments, curriculum, internships, and graduation.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  studentService,
  subjectService,
  enrollmentService,
  curriculumService,
  internshipService,
  graduationService,
} from '@/services/sis.service';
import type {
  StudentFilters,
  Student,
  SubjectFilters,
  Subject,
  EnrollmentFilters,
  Enrollment,
  CurriculumFilters,
  Curriculum,
  InternshipFilters,
  Internship,
  GraduationFilters,
} from '@/services/sis.service';
import { useNotificationStore } from '@/stores/notificationStore';

// ─── Students ──────────────────────────────────────────────────────────────────

export const useStudentList = (filters: StudentFilters) =>
  useQuery({
    queryKey: ['sis', 'students', 'list', filters],
    queryFn: () => studentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useStudentDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'students', id],
    queryFn: () => studentService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useStudentStats = () =>
  useQuery({
    queryKey: ['sis', 'students', 'stats'],
    queryFn: () => studentService.stats().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'students'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm sinh viên mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo sinh viên thất bại',
      });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) => studentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'students'] });
      qc.setQueryData(['sis', 'students', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thông tin sinh viên' });
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

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'students'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa sinh viên' });
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

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const useSubjectList = (filters: SubjectFilters) =>
  useQuery({
    queryKey: ['sis', 'subjects', 'list', filters],
    queryFn: () => subjectService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useSubjectDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'subjects', id],
    queryFn: () => subjectService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateSubject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'subjects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm môn học mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo môn học thất bại',
      });
    },
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) => subjectService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'subjects'] });
      qc.setQueryData(['sis', 'subjects', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật môn học' });
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

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: subjectService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'subjects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa môn học' });
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

// ─── Enrollments ───────────────────────────────────────────────────────────────

export const useEnrollmentList = (filters: EnrollmentFilters) =>
  useQuery({
    queryKey: ['sis', 'enrollments', 'list', filters],
    queryFn: () => enrollmentService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useEnrollmentDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'enrollments', id],
    queryFn: () => enrollmentService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateEnrollment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: enrollmentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'enrollments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm đăng ký học phần' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo đăng ký thất bại',
      });
    },
  });
};

export const useUpdateEnrollment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Enrollment> }) => enrollmentService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'enrollments'] });
      qc.setQueryData(['sis', 'enrollments', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đăng ký học phần' });
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

// ─── Curriculum ────────────────────────────────────────────────────────────────

export const useCurriculumList = (filters: CurriculumFilters) =>
  useQuery({
    queryKey: ['sis', 'curriculum', 'list', filters],
    queryFn: () => curriculumService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useCurriculumDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'curriculum', id],
    queryFn: () => curriculumService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateCurriculum = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: curriculumService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'curriculum'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm chương trình đào tạo' });
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

export const useUpdateCurriculum = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Curriculum> }) => curriculumService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'curriculum'] });
      qc.setQueryData(['sis', 'curriculum', vars.id], result.data);
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

// ─── Internships ───────────────────────────────────────────────────────────────

export const useInternshipList = (filters: InternshipFilters) =>
  useQuery({
    queryKey: ['sis', 'internships', 'list', filters],
    queryFn: () => internshipService.list(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useInternshipDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'internships', id],
    queryFn: () => internshipService.get(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateInternship = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: internshipService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'internships'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm thực tập mới' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thực tập thất bại',
      });
    },
  });
};

export const useUpdateInternship = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Internship> }) => internshipService.update(id, data),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'internships'] });
      qc.setQueryData(['sis', 'internships', vars.id], result.data);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật thực tập' });
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

// ─── Graduation Sessions & Records ─────────────────────────────────────────────

export const useGraduationSessionList = (filters: GraduationFilters) =>
  useQuery({
    queryKey: ['sis', 'graduation', 'sessions', filters],
    queryFn: () => graduationService.sessions(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

export const useGraduationSessionDetail = (id: string) =>
  useQuery({
    queryKey: ['sis', 'graduation', 'sessions', id],
    queryFn: () => graduationService.sessions({ id } as GraduationFilters).then((r) => r.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateGraduationSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: graduationService.createSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đợt xét tốt nghiệp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo đợt xét thất bại',
      });
    },
  });
};

export const useUpdateGraduationSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => graduationService.updateSession(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật đợt xét tốt nghiệp' });
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

export const useCloseGraduationSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: graduationService.closeSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã đóng đợt xét tốt nghiệp' });
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

export const useGraduationRecords = (sessionId: string) =>
  useQuery({
    queryKey: ['sis', 'graduation', 'records', sessionId],
    queryFn: () => graduationService.records(sessionId).then((r) => r.data),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateGraduationRecord = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) =>
      graduationService.createRecord(sessionId, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation', 'records', vars.sessionId] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã thêm hồ sơ tốt nghiệp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Thêm hồ sơ thất bại',
      });
    },
  });
};

export const useUpdateGraduationRecord = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ sessionId, recordId, data }: { sessionId: string; recordId: string; data: any }) =>
      graduationService.updateRecord(sessionId, recordId, data),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation', 'records', vars.sessionId] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật hồ sơ tốt nghiệp' });
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

export const useDeleteGraduationRecord = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();
  return useMutation({
    mutationFn: ({ sessionId, recordId }: { sessionId: string; recordId: string }) =>
      graduationService.deleteRecord(sessionId, recordId),
    onSuccess: (_result, vars) => {
      qc.invalidateQueries({ queryKey: ['sis', 'graduation', 'records', vars.sessionId] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa hồ sơ tốt nghiệp' });
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

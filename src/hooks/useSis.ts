// TanStack Query Hooks cho module SIS
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// ─── Curriculum types ────────────────────────────────────────────────────────

export type SubjectCategory = 'required' | 'elective' | 'optional';

export interface CurriculumSubjectRef {
  subject: string | { _id: string; code: string; name: string; credits?: number };
  semester: number;
  category: SubjectCategory; // 'required' | 'elective' | 'optional'
  groupCode?: string; // Mã nhóm lựa chọn (VD: NL, TC, TN...)
}

export interface Curriculum {
  _id: string;
  code: string;
  name: string;
  department: string | { _id: string; code: string; name: string };
  degreeType: 'Cử nhân' | 'Kỹ sư' | 'Thạc sĩ' | 'Tiến sĩ';
  durationYears: number;
  totalCredits: number;
  // Phân loại tín chỉ theo chuẩn CTĐT Việt Nam
  requiredCredits: number; // Tín chỉ bắt buộc
  electiveCredits: number; // Tín chỉ lựa chọn
  optionalCredits: number; // Tín chỉ tự chọn
  subjects: CurriculumSubjectRef[];
  effectiveYear: number;
  status: 'draft' | 'active' | 'archived';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: 'draft' | 'active' | 'archived';
  degreeType?: 'Cử nhân' | 'Kỹ sư' | 'Thạc sĩ' | 'Tiến sĩ';
}

export interface CreateCurriculumInput {
  code: string;
  name: string;
  department: string;
  degreeType: 'Cử nhân' | 'Kỹ sư' | 'Thạc sĩ' | 'Tiến sĩ';
  durationYears: number;
  totalCredits: number;
  // Phân loại tín chỉ
  requiredCredits: number;
  electiveCredits: number;
  optionalCredits: number;
  subjects: Array<{
    subject: string;
    semester: number;
    category: SubjectCategory;
    groupCode?: string;
  }>;
  effectiveYear: number;
  description?: string;
}

export type UpdateCurriculumInput = Partial<CreateCurriculumInput> & {
  status?: 'draft' | 'active' | 'archived';
};

// ─── Curriculum hooks ────────────────────────────────────────────────────────

export const useCurriculumList = (filters: CurriculumFilters = {}) => {
  return useQuery({
    queryKey: ['curricula', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Curriculum>>('/sis/curricula', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCurriculumDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['curricula', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Curriculum>>(`/sis/curricula/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useCreateCurriculum = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateCurriculumInput) => {
      const response = await api.post<ApiResponse<Curriculum>>('/sis/curricula', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curricula'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã tạo chương trình đào tạo mới',
      });
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateCurriculumInput }) => {
      const response = await api.patch<ApiResponse<Curriculum>>(`/sis/curricula/${id}`, data);
      return response.data;
    },
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ['curricula'] });
      qc.invalidateQueries({ queryKey: ['curricula', variables.id] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật chương trình đào tạo',
      });
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

export const useDeleteCurriculum = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sis/curricula/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curricula'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa chương trình đào tạo',
      });
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

// ─── Subject hook (phục vụ chọn môn trong form Curriculum) ──────────────────

export interface Subject {
  _id: string;
  code: string;
  name: string;
  credits: number;
  theoryHours?: number;
  practiceHours?: number;
  department?: { _id: string; code: string; name: string } | string;
  description?: string;
  isActive: boolean;
}

export const useSubjectList = (filters: { page?: number; pageSize?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Subject>>('/sis/subjects', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useSubjectDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Subject>>(`/sis/subjects/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export interface CreateSubjectInput {
  code: string;
  name: string;
  credits: number;
  theoryHours?: number;
  practiceHours?: number;
  description?: string;
  department?: string;
  isActive?: boolean;
}

export type UpdateSubjectInput = Partial<CreateSubjectInput>;

export const useCreateSubject = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateSubjectInput) => {
      const response = await api.post<ApiResponse<Subject>>('/sis/subjects', data);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo môn học mới' });
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubjectInput }) => {
      const response = await api.patch<ApiResponse<Subject>>(`/sis/subjects/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['subjects', variables.id] });
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
    mutationFn: async (id: string) => {
      await api.delete(`/sis/subjects/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa môn học' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Xóa môn học thất bại',
      });
    },
  });
};

// ─── Course hooks (phục vụ form Enrollment) ────────────────────────────────

export interface CourseRef {
  _id: string;
  name: string;
  code: string;
  semester?: number;
  academicYear?: string;
  credits?: number;
}

export interface Course {
  _id: string;
  code: string;
  name: string;
  subject: string | { _id: string; code: string; name: string; credits?: number };
  semester: number;
  academicYear: string;
  lecturer?: { _id: string; name: string; code?: string };
  department?: { _id: string; code: string; name: string };
  schedule?: string;
  room?: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'draft' | 'open' | 'closed' | 'cancelled' | 'completed';
  startDate?: string;
  endDate?: string;
}

export const useCourseList = (filters: {
  page?: number;
  pageSize?: number;
  semester?: number;
  academicYear?: string;
  status?: string;
  subject?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Course>>('/sis/courses', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ─── Student hooks (phục vụ form Enrollment, Graduation) ──────────────────

export interface Student {
  _id: string;
  code: string;
  name: string;
  className?: string;
  major?: string;
  department?: { _id: string; code: string; name: string } | string;
  courseYear?: number;
  status: 'studying' | 'graduated' | 'suspended' | 'expelled' | 'reserved';
  gpa?: number;
  totalCredits?: number;
}

export const useStudentList = (filters: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  department?: string;
} = {}) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Student>>('/sis/students', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ─── Student mutations ───────────────────────────────────────────────────────

export interface CreateStudentInput {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  className?: string;
  major?: string;
  department?: string;
  courseYear?: number;
  enrollmentDate?: string;
}

const sanitizeOptional = <T extends Record<string, any>>(data: T): T => {
  const out: any = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === '' || v === null || v === undefined) continue;
    out[k] = v;
  }
  return out as T;
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: async (data: CreateStudentInput) => {
      const payload = sanitizeOptional(data);
      const response = await api.post<ApiResponse<Student>>('/sis/students', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      addNotification({ type: 'success', message: 'Thêm sinh viên thành công!' });
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        message: error?.response?.data?.error?.message || 'Có lỗi khi thêm sinh viên' 
      });
    },
  });
};

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  id: string;
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: async (data: UpdateStudentInput) => {
      const { id, ...rest } = data;
      const payload = sanitizeOptional(rest);
      const response = await api.patch<ApiResponse<Student>>(`/sis/students/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      addNotification({ type: 'success', message: 'Cập nhật sinh viên thành công!' });
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        message: error?.response?.data?.error?.message || 'Có lỗi khi cập nhật sinh viên' 
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<null>>(`/sis/students/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      addNotification({ type: 'success', message: 'Xóa sinh viên thành công!' });
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        message: error?.response?.data?.error?.message || 'Có lỗi khi xóa sinh viên' 
      });
    },
  });
};

// ─── Enrollment hooks ───────────────────────────────────────────────────────

export interface EnrollmentStudentRef {
  _id: string;
  name: string;
  code: string;
  className?: string;
  major?: string;
}

export interface EnrollmentCourseRef {
  _id: string;
  name: string;
  code: string;
  semester?: number;
  academicYear?: string;
  subject?: { _id: string; name: string; code: string; credits?: number };
}

export interface Enrollment {
  _id: string;
  student: EnrollmentStudentRef | string;
  course: EnrollmentCourseRef | string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'withdrawn';
  enrollmentDate: string;
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  letterGrade?: string;
  attendanceCount?: number;
  totalSessions?: number;
  notes?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface EnrollmentFilters {
  page?: number;
  pageSize?: number;
  student?: string;
  course?: string;
  status?: string;
  search?: string;
}

export const useEnrollmentList = (filters: EnrollmentFilters = {}) => {
  return useQuery({
    queryKey: ['enrollments', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Enrollment>>('/sis/enrollments', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useEnrollmentDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['enrollments', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Enrollment>>(`/sis/enrollments/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export interface CreateEnrollmentInput {
  student: string;
  course: string;
}

export type UpdateEnrollmentInput = Partial<CreateEnrollmentInput> & {
  status?: Enrollment['status'];
  midtermScore?: number;
  finalScore?: number;
  attendanceCount?: number;
  totalSessions?: number;
  notes?: string;
};

export const useCreateEnrollment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateEnrollmentInput) => {
      const response = await api.post<ApiResponse<Enrollment>>('/sis/enrollments', data);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo đăng ký học phần' });
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateEnrollmentInput }) => {
      const response = await api.patch<ApiResponse<Enrollment>>(`/sis/enrollments/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollments', variables.id] });
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

export const useGradeEnrollment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { midtermScore?: number; finalScore?: number; attendanceCount?: number; totalSessions?: number; notes?: string };
    }) => {
      const response = await api.post<ApiResponse<Enrollment>>(`/sis/enrollments/${id}/grade`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['enrollments', variables.id] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã ghi nhận điểm' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Ghi điểm thất bại',
      });
    },
  });
};

export const useDeleteEnrollment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sis/enrollments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy đăng ký' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Hủy đăng ký thất bại',
      });
    },
  });
};

// ─── Graduation Session hooks ───────────────────────────────────────────────

export interface GraduationSession {
  _id: string;
  name: string;
  semester: string;
  academicYear: string;
  openDate: string;
  closeDate: string;
  reviewDate?: string;
  status: 'draft' | 'open' | 'closed' | 'reviewed';
  description?: string;
  totalCandidates: number;
}

export interface CreateGraduationSessionInput {
  name: string;
  semester: string;
  academicYear: string;
  openDate: string;
  closeDate: string;
  reviewDate?: string;
  status?: GraduationSession['status'];
  description?: string;
  totalCandidates?: number;
}

export type UpdateGraduationSessionInput = Partial<CreateGraduationSessionInput>;

export const useGraduationSessionList = (filters: {
  page?: number;
  pageSize?: number;
  status?: string;
  semester?: string;
  academicYear?: string;
} = {}) => {
  return useQuery({
    queryKey: ['graduation-sessions', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<GraduationSession>>('/sis/graduation-sessions', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateGraduationSession = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateGraduationSessionInput) => {
      const response = await api.post<ApiResponse<GraduationSession>>('/sis/graduation-sessions', data);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graduation-sessions'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã mở đợt xét tốt nghiệp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Mở đợt xét thất bại',
      });
    },
  });
};

export const useGraduationSessionById = (id?: string) => {
  return useQuery({
    queryKey: ['graduation-session', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<GraduationSession>>(`/sis/graduation-sessions/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useGraduationSessionStudents = (sessionId?: string) => {
  return useQuery({
    queryKey: ['graduation-session-students', sessionId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Graduation[]>>(`/sis/graduation-sessions/${sessionId}/students`);
      return response.data.data;
    },
    enabled: !!sessionId,
  });
};

// ─── Graduation hooks ───────────────────────────────────────────────────────

export interface GraduationStudentRef {
  _id: string;
  name: string;
  code: string;
  className?: string;
  major?: string;
  gpa?: number;
  totalCredits?: number;
}

export interface GraduationSessionRef {
  _id: string;
  name: string;
  semester: string;
  academicYear: string;
}

export interface GraduationCondition {
  code: string;
  label: string;
  required: string;
  actual: string;
  met: boolean;
}

export interface Graduation {
  _id: string;
  student: GraduationStudentRef | string;
  session: GraduationSessionRef | string;
  cohort: string;
  enrollmentDate: string;
  graduationYear: number;
  graduationSemester: string;
  gpa: number;
  totalCredits: number;
  thesisTitle?: string;
  thesisScore?: number;
  thesisAdvisor?: string;
  thesisDefendedAt?: string;
  degree: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình';
  diplomaNo?: string;
  diplomaDate?: string;
  status: 'pending_review' | 'graduated' | 'diploma_issued' | 'not_met';
  conditions: GraduationCondition[];
  notes?: string;
}

export interface GraduationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  student?: string;
  session?: string;
  status?: string;
  graduationYear?: number;
}

export const useGraduationList = (filters: GraduationFilters = {}) => {
  return useQuery({
    queryKey: ['graduations', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Graduation>>('/sis/graduations', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGraduationDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['graduations', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Graduation>>(`/sis/graduations/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export interface CreateGraduationInput {
  student: string;
  session: string;
  cohort: string;
  enrollmentDate: string;
  graduationYear: number;
  graduationSemester: string;
  gpa: number;
  totalCredits: number;
  thesisTitle?: string;
  thesisScore?: number;
  thesisAdvisor?: string;
  thesisDefendedAt?: string;
  degree: Graduation['degree'];
  diplomaNo?: string;
  diplomaDate?: string;
  status?: Graduation['status'];
  conditions?: GraduationCondition[];
  notes?: string;
}

export type UpdateGraduationInput = Partial<CreateGraduationInput>;

export const useCreateGraduation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateGraduationInput) => {
      const response = await api.post<ApiResponse<Graduation>>('/sis/graduations', data);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graduations'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo hồ sơ tốt nghiệp' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo hồ sơ thất bại',
      });
    },
  });
};

export const useUpdateGraduation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGraduationInput }) => {
      const response = await api.patch<ApiResponse<Graduation>>(`/sis/graduations/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['graduations'] });
      qc.invalidateQueries({ queryKey: ['graduations', variables.id] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật hồ sơ' });
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

export const useIssueDiploma = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      diplomaNo,
      diplomaDate,
    }: {
      id: string;
      diplomaNo: string;
      diplomaDate: string;
    }) => {
      const response = await api.post<ApiResponse<Graduation>>(
        `/sis/graduations/${id}/issue-diploma`,
        { diplomaNo, diplomaDate }
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['graduations'] });
      qc.invalidateQueries({ queryKey: ['graduations', variables.id] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cấp bằng tốt nghiệp' });
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

export const useDeleteGraduation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sis/graduations/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['graduations'] });
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

// ─── Internship hooks ───────────────────────────────────────────────────────

export interface Internship {
  _id: string;
  student: { _id: string; name: string; code: string } | string;
  studentCode: string;
  studentName: string;
  className?: string;
  major?: string;
  department?: { _id: string; code: string; name: string } | string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  supervisor?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  status: 'registered' | 'in_progress' | 'pending_report' | 'completed' | 'rejected';
  progress: number;
  reportSubmitted: boolean;
  grade?: number;
  description?: string;
}

export interface InternshipFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  major?: string;
  search?: string;
}

export const useInternshipList = (filters: InternshipFilters = {}) => {
  return useQuery({
    queryKey: ['internships', 'list', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Internship>>('/sis/internships', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInternshipDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['internships', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Internship>>(`/sis/internships/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export interface CreateInternshipInput {
  student: string;
  studentCode: string;
  studentName: string;
  className?: string;
  major?: string;
  department?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  supervisor?: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  status?: Internship['status'];
  progress?: number;
  reportSubmitted?: boolean;
  grade?: number;
  description?: string;
}

export type UpdateInternshipInput = Partial<CreateInternshipInput>;

export const useCreateInternship = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: CreateInternshipInput) => {
      const response = await api.post<ApiResponse<Internship>>('/sis/internships', data);
      return response.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['internships'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã tạo hồ sơ thực tập' });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo hồ sơ thất bại',
      });
    },
  });
};

export const useUpdateInternship = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInternshipInput }) => {
      const response = await api.patch<ApiResponse<Internship>>(`/sis/internships/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['internships'] });
      qc.invalidateQueries({ queryKey: ['internships', variables.id] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã cập nhật hồ sơ thực tập' });
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

export const useDeleteInternship = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sis/internships/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['internships'] });
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã xóa hồ sơ thực tập' });
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

// ─── HRM API Hooks ──────────────────────────────────────────────────────────────
// TanStack Query hooks for HRM Module API

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { hrmApi } from '@/lib/hrmApiClient';
import { useNotificationStore } from '@/stores/notificationStore';
import type {
  // Master Data
  AcademicRank,
  AcademicRankCreatePayload,
  AcademicRankListParams,
  Position,
  PositionCreatePayload,
  PositionListParams,
  // Employee
  EmployeeProfile,
  EmployeeProfileCreatePayload,
  EmployeeProfileListParams,
  // Related
  Degree,
  DegreeCreatePayload,
  DegreeListParams,
  Certificate,
  CertificateCreatePayload,
  CertificateListParams,
  TrainingHistory,
  TrainingHistoryCreatePayload,
  TrainingHistoryListParams,
  WorkHistory,
  WorkHistoryCreatePayload,
  WorkHistoryListParams,
  // Work Assignments
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  TeachingAssignmentListParams,
  AdvisorAssignment,
  AdvisorAssignmentCreatePayload,
  AdvisorAssignmentListParams,
  InternshipSupervision,
  InternshipSupervisionCreatePayload,
  InternshipSupervisionListParams,
  ThesisSupervision,
  ThesisSupervisionCreatePayload,
  ThesisSupervisionListParams,
  // Exam
  ExamInvigilation,
  ExamInvigilationCreatePayload,
  ExamInvigilationListParams,
  ExamMarking,
  ExamMarkingCreatePayload,
  ExamMarkingListParams,
  HrmListResponse,
  HrmDetailResponse,
} from '@/types/hrm.types';
import type { ApiResponse, PaginatedResponse, Department, LeaveRequest } from '@/types/api.types';

// ─── Legacy Types ──────────────────────────────────────────────────────────────
interface VienChucFilters {
  [key: string]: string | number | undefined;
}

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const HRM_QUERY_KEYS = {
  // Master Data
  academicRanks: {
    all: ['hrm', 'academic-ranks'] as const,
    list: (params?: AcademicRankListParams) =>
      ['hrm', 'academic-ranks', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'academic-ranks', 'detail', id] as const,
  },
  positions: {
    all: ['hrm', 'positions'] as const,
    list: (params?: PositionListParams) =>
      ['hrm', 'positions', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'positions', 'detail', id] as const,
  },
  // Employee
  employeeProfiles: {
    all: ['hrm', 'employee-profiles'] as const,
    list: (params?: EmployeeProfileListParams) =>
      ['hrm', 'employee-profiles', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'employee-profiles', 'detail', id] as const,
  },
  // Related
  degrees: {
    all: ['hrm', 'degrees'] as const,
    list: (params?: DegreeListParams) =>
      ['hrm', 'degrees', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'degrees', 'detail', id] as const,
  },
  certificates: {
    all: ['hrm', 'certificates'] as const,
    list: (params?: CertificateListParams) =>
      ['hrm', 'certificates', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'certificates', 'detail', id] as const,
  },
  trainingHistories: {
    all: ['hrm', 'training-histories'] as const,
    list: (params?: TrainingHistoryListParams) =>
      ['hrm', 'training-histories', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'training-histories', 'detail', id] as const,
  },
  workHistories: {
    all: ['hrm', 'work-histories'] as const,
    list: (params?: WorkHistoryListParams) =>
      ['hrm', 'work-histories', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'work-histories', 'detail', id] as const,
  },
  // Work Assignments
  teachingAssignments: {
    all: ['hrm', 'teaching-assignments'] as const,
    list: (params?: TeachingAssignmentListParams) =>
      ['hrm', 'teaching-assignments', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'teaching-assignments', 'detail', id] as const,
  },
  advisorAssignments: {
    all: ['hrm', 'advisor-assignments'] as const,
    list: (params?: AdvisorAssignmentListParams) =>
      ['hrm', 'advisor-assignments', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'advisor-assignments', 'detail', id] as const,
  },
  internshipSupervisions: {
    all: ['hrm', 'internship-supervisions'] as const,
    list: (params?: InternshipSupervisionListParams) =>
      ['hrm', 'internship-supervisions', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'internship-supervisions', 'detail', id] as const,
  },
  thesisSupervisions: {
    all: ['hrm', 'thesis-supervisions'] as const,
    list: (params?: ThesisSupervisionListParams) =>
      ['hrm', 'thesis-supervisions', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'thesis-supervisions', 'detail', id] as const,
  },
  // Exam
  examInvigilations: {
    all: ['hrm', 'exam-invigilations'] as const,
    list: (params?: ExamInvigilationListParams) =>
      ['hrm', 'exam-invigilations', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'exam-invigilations', 'detail', id] as const,
  },
  examMarkings: {
    all: ['hrm', 'exam-markings'] as const,
    list: (params?: ExamMarkingListParams) =>
      ['hrm', 'exam-markings', 'list', params ?? {}] as const,
    detail: (id: number) =>
      ['hrm', 'exam-markings', 'detail', id] as const,
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────────

const handleApiError = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

// ─── Master Data Hooks ──────────────────────────────────────────────────────────

// Academic Ranks
export const useAcademicRanks = (params?: AcademicRankListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.academicRanks.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<AcademicRank>>('/hrm/academic-ranks', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

export const useAcademicRank = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.academicRanks.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<AcademicRank>>(`/hrm/academic-ranks/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
};

export const useCreateAcademicRank = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: AcademicRankCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<AcademicRank>>(
        '/hrm/academic-ranks',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.academicRanks.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm học hàm/học vị mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateAcademicRank = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: AcademicRankCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<AcademicRank>>(
        `/hrm/academic-ranks/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.academicRanks.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật học hàm/học vị',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteAcademicRank = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/academic-ranks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.academicRanks.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa học hàm/học vị',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Positions
export const usePositions = (params?: PositionListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.positions.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<Position>>('/hrm/positions', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

export const usePosition = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.positions.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<Position>>(`/hrm/positions/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
};

export const useCreatePosition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: PositionCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<Position>>(
        '/hrm/positions',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.positions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm chức vụ mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdatePosition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: PositionCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<Position>>(
        `/hrm/positions/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.positions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật chức vụ',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeletePosition = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/positions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.positions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa chức vụ',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Employee Profile Hooks ─────────────────────────────────────────────────────

export const useEmployeeProfiles = (params?: EmployeeProfileListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.employeeProfiles.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<EmployeeProfile>>(
        '/hrm/employee-profiles',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useEmployeeProfile = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.employeeProfiles.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<EmployeeProfile>>(
        `/hrm/employee-profiles/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateEmployeeProfile = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: EmployeeProfileCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<EmployeeProfile>>(
        '/hrm/employee-profiles',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employeeProfiles.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm hồ sơ nhân sự mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateEmployeeProfile = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmployeeProfileCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<EmployeeProfile>>(
        `/hrm/employee-profiles/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employeeProfiles.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật hồ sơ nhân sự',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteEmployeeProfile = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/employee-profiles/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employeeProfiles.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa hồ sơ nhân sự',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Related Entity Hooks ───────────────────────────────────────────────────────

// Degrees
export const useDegrees = (params?: DegreeListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.degrees.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<Degree>>('/hrm/degrees', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useDegree = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.degrees.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<Degree>>(`/hrm/degrees/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDegree = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: DegreeCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<Degree>>('/hrm/degrees', payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.degrees.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm bằng cấp',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateDegree = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: DegreeCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<Degree>>(`/hrm/degrees/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.degrees.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật bằng cấp',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteDegree = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/degrees/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.degrees.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa bằng cấp',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Certificates
export const useCertificates = (params?: CertificateListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.certificates.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<Certificate>>('/hrm/certificates', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCertificate = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.certificates.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<Certificate>>(
        `/hrm/certificates/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCertificate = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: CertificateCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<Certificate>>(
        '/hrm/certificates',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.certificates.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm chứng chỉ',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateCertificate = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CertificateCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<Certificate>>(
        `/hrm/certificates/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.certificates.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật chứng chỉ',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteCertificate = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/certificates/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.certificates.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa chứng chỉ',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Training Histories
export const useTrainingHistories = (params?: TrainingHistoryListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.trainingHistories.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<TrainingHistory>>(
        '/hrm/training-histories',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useTrainingHistory = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.trainingHistories.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<TrainingHistory>>(
        `/hrm/training-histories/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTrainingHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: TrainingHistoryCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<TrainingHistory>>(
        '/hrm/training-histories',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.trainingHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm quá trình đào tạo',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateTrainingHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TrainingHistoryCreatePayload;
    }) => {
      const response = await hrmApi.put<HrmDetailResponse<TrainingHistory>>(
        `/hrm/training-histories/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.trainingHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật quá trình đào tạo',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteTrainingHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/training-histories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.trainingHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa quá trình đào tạo',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Work Histories
export const useWorkHistories = (params?: WorkHistoryListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.workHistories.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<WorkHistory>>('/hrm/work-histories', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useWorkHistory = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.workHistories.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<WorkHistory>>(
        `/hrm/work-histories/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateWorkHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: WorkHistoryCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<WorkHistory>>(
        '/hrm/work-histories',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm quá trình công tác',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateWorkHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: WorkHistoryCreatePayload }) => {
      const response = await hrmApi.put<HrmDetailResponse<WorkHistory>>(
        `/hrm/work-histories/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật quá trình công tác',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteWorkHistory = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/work-histories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workHistories.all });
      addNotification({
        type: 'success',
        title: 'Thành côi',
        message: 'Đã xóa quá trình công tác',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Work Assignment Hooks ──────────────────────────────────────────────────────

// Teaching Assignments
export const useTeachingAssignments = (params?: TeachingAssignmentListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.teachingAssignments.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<TeachingAssignment>>(
        '/hrm/teaching-assignments',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useTeachingAssignment = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.teachingAssignments.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<TeachingAssignment>>(
        `/hrm/teaching-assignments/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTeachingAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: TeachingAssignmentCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<TeachingAssignment>>(
        '/hrm/teaching-assignments',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.teachingAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm phân công giảng dạy',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateTeachingAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TeachingAssignmentCreatePayload;
    }) => {
      const response = await hrmApi.put<HrmDetailResponse<TeachingAssignment>>(
        `/hrm/teaching-assignments/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.teachingAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật phân công giảng dạy',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteTeachingAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/teaching-assignments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.teachingAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa phân công giảng dạy',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Advisor Assignments
export const useAdvisorAssignments = (params?: AdvisorAssignmentListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.advisorAssignments.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<AdvisorAssignment>>(
        '/hrm/advisor-assignments',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdvisorAssignment = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.advisorAssignments.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<AdvisorAssignment>>(
        `/hrm/advisor-assignments/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAdvisorAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: AdvisorAssignmentCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<AdvisorAssignment>>(
        '/hrm/advisor-assignments',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.advisorAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm phân công cố vấn',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateAdvisorAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: AdvisorAssignmentCreatePayload;
    }) => {
      const response = await hrmApi.put<HrmDetailResponse<AdvisorAssignment>>(
        `/hrm/advisor-assignments/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.advisorAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật phân công cố vấn',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteAdvisorAssignment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/advisor-assignments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.advisorAssignments.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa phân công cố vấn',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Internship Supervisions
export const useInternshipSupervisions = (params?: InternshipSupervisionListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.internshipSupervisions.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<InternshipSupervision>>(
        '/hrm/internship-supervisions',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useInternshipSupervision = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.internshipSupervisions.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<InternshipSupervision>>(
        `/hrm/internship-supervisions/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateInternshipSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: InternshipSupervisionCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<InternshipSupervision>>(
        '/hrm/internship-supervisions',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.internshipSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm hướng dẫn thực tập',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateInternshipSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: InternshipSupervisionCreatePayload;
    }) => {
      const response = await hrmApi.put<HrmDetailResponse<InternshipSupervision>>(
        `/hrm/internship-supervisions/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.internshipSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật hướng dẫn thực tập',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteInternshipSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/internship-supervisions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.internshipSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa hướng dẫn thực tập',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// Thesis Supervisions
export const useThesisSupervisions = (params?: ThesisSupervisionListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.thesisSupervisions.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<ThesisSupervision>>(
        '/hrm/thesis-supervisions',
        { params } as any
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useThesisSupervision = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.thesisSupervisions.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<ThesisSupervision>>(
        `/hrm/thesis-supervisions/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateThesisSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: ThesisSupervisionCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<ThesisSupervision>>(
        '/hrm/thesis-supervisions',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.thesisSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm hướng dẫn đồ án',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateThesisSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ThesisSupervisionCreatePayload;
    }) => {
      const response = await hrmApi.put<HrmDetailResponse<ThesisSupervision>>(
        `/hrm/thesis-supervisions/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.thesisSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật hướng dẫn đồ án',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteThesisSupervision = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/thesis-supervisions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.thesisSupervisions.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa hướng dẫn đồ án',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Exam Invigilation Hooks (Coi thi) ─────────────────────────────────────────

export const useExamInvigilations = (params?: ExamInvigilationListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.examInvigilations.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<ExamInvigilation>>('/hrm/exam-invigilations', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useExamInvigilation = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.examInvigilations.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<ExamInvigilation>>(`/hrm/exam-invigilations/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateExamInvigilation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: ExamInvigilationCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<ExamInvigilation>>('/hrm/exam-invigilations', payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examInvigilations.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm phân công coi thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateExamInvigilation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ExamInvigilationCreatePayload> }) => {
      const response = await hrmApi.put<HrmDetailResponse<ExamInvigilation>>(`/hrm/exam-invigilations/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examInvigilations.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật phân công coi thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteExamInvigilation = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/exam-invigilations/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examInvigilations.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa phân công coi thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Exam Marking Hooks (Chấm thi) ─────────────────────────────────────────────

export const useExamMarkings = (params?: ExamMarkingListParams) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.examMarkings.list(params),
    queryFn: async () => {
      const response = await hrmApi.get<HrmListResponse<ExamMarking>>('/hrm/exam-markings', {
        params,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useExamMarking = (id?: number) => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.examMarkings.detail(id ?? 0),
    queryFn: async () => {
      const response = await hrmApi.get<HrmDetailResponse<ExamMarking>>(`/hrm/exam-markings/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateExamMarking = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (payload: ExamMarkingCreatePayload) => {
      const response = await hrmApi.post<HrmDetailResponse<ExamMarking>>('/hrm/exam-markings', payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examMarkings.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm phân công chấm thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Tạo thất bại'),
      });
    },
  });
};

export const useUpdateExamMarking = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ExamMarkingCreatePayload> }) => {
      const response = await hrmApi.put<HrmDetailResponse<ExamMarking>>(`/hrm/exam-markings/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examMarkings.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật phân công chấm thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Cập nhật thất bại'),
      });
    },
  });
};

export const useDeleteExamMarking = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: number) => {
      await hrmApi.delete(`/hrm/exam-markings/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HRM_QUERY_KEYS.examMarkings.all });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa phân công chấm thi',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: handleApiError(error, 'Xóa thất bại'),
      });
    },
  });
};

// ─── Legacy Hooks (Backward Compatibility) ────────────────────────────────────

export const useVienChucList = (filters: VienChucFilters = {}) => {
  return useQuery({
    queryKey: ['vienChuc', 'list', filters],
    queryFn: async () => {
      const response = await hrmApi.get<PaginatedResponse<any>>('/hrm/vien-chuc', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
};

export const useVienChucDetail = (id: string) => {
  return useQuery({
    queryKey: ['vienChuc', id],
    queryFn: async () => {
      const response = await hrmApi.get<ApiResponse<any>>(`/hrm/vien-chuc/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useVienChucStats = () => {
  return useQuery({
    queryKey: ['vienChuc', 'stats'],
    queryFn: async () => {
      const response = await hrmApi.get<ApiResponse<any>>('/hrm/vien-chuc-stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await hrmApi.post<ApiResponse<any>>('/hrm/vien-chuc', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm viên chức mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thất bại',
      });
    },
  });
};

export const useUpdateVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await hrmApi.patch<ApiResponse<any>>(`/hrm/vien-chuc/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật thông tin',
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

export const useDeleteVienChuc = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await hrmApi.delete(`/hrm/vien-chuc/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vienChuc'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa viên chức',
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

export const useDepartmentList = (options?: { type?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: ['departments', options],
    queryFn: async () => {
      const response = await hrmApi.get<ApiResponse<Department[]>>('/hrm/departments', {
        params: options,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: Partial<Department>) => {
      const response = await hrmApi.post<ApiResponse<Department>>('/hrm/departments', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm đơn vị mới',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Tạo thất bại',
      });
    },
  });
};

export const useLeaveRequestList = (filters?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery({
    queryKey: ['leaveRequests', filters],
    queryFn: async () => {
      const response = await hrmApi.get<PaginatedResponse<LeaveRequest>>('/hrm/leave-requests', {
        params: filters,
      } as any);
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateLeaveRequest = () => {
  const qc = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: async (data: Partial<LeaveRequest>) => {
      const response = await hrmApi.post<ApiResponse<LeaveRequest>>('/hrm/leave-requests', data);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaveRequests'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã gửi đơn nghỉ phép',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: error?.response?.data?.error?.message || 'Gửi đơn thất bại',
      });
    },
  });
};

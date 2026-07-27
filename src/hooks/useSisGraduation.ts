// ─── Graduation Management Hooks for SIS API ───────────────────────────────────
// Uses the dedicated SIS API client (api.hqnhat.id.vn)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sisApi } from '@/lib/sisApiClient';
import type {
  SisListResponse,
  SisDetailResponse,
} from '@/types/api.types';

// ════════════════════════════════════════════════════════════════════════════════
// Course (Khóa học — dùng để populate dropdown trong GraduationBatch)
// ════════════════════════════════════════════════════════════════════════════════

export interface Course {
  id: number;
  code: string;
  name: string;
  start_year: number;
  end_year: number;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export const useSisCourses = (params?: { page?: number; per_page?: number; status?: number }) => {
  return useQuery({
    queryKey: ['sis', 'courses', 'list', params ?? {}],
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<Course>>(
        '/api/v1/sis/courses',
        { params }
      );
      return response.data;
    },
    staleTime: 60000,
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// Graduation Batch (Đợt xét tốt nghiệp)
// ════════════════════════════════════════════════════════════════════════════════

export interface GraduationBatch {
  id: number;
  code: string;
  name: string;
  academic_term_id: number;
  course_id: number | null;
  graduation_date: string | null;
  decision_no: string | null;
  decision_date: string | null;
  note: string | null;
  status: number;
  academic_term?: AcademicTermRef;
  created_at: string;
  updated_at: string;
}

export interface AcademicTermRef {
  id: number;
  code: string;
  name: string;
}

export interface GraduationBatchListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  academic_term_id?: number;
  status?: number;
}

export interface GraduationBatchCreatePayload {
  code: string;
  name: string;
  academic_term_id: number;
  course_id: number;
  graduation_date?: string | null;
  decision_no?: string | null;
  decision_date?: string | null;
  note?: string | null;
  status: number;
}

export const SIS_QUERY_KEYS = {
  graduationBatches: {
    all: ['sis', 'graduation-batches'] as const,
    list: (params?: GraduationBatchListParams) =>
      ['sis', 'graduation-batches', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['sis', 'graduation-batches', 'detail', id] as const,
  },
  graduationCandidates: {
    all: ['sis', 'graduation-candidates'] as const,
    list: (params?: GraduationCandidateListParams) =>
      ['sis', 'graduation-candidates', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['sis', 'graduation-candidates', 'detail', id] as const,
  },
  graduations: {
    all: ['sis', 'graduations'] as const,
    list: (params?: GraduationRecordListParams) =>
      ['sis', 'graduations', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['sis', 'graduations', 'detail', id] as const,
  },
  gpaHistories: {
    all: ['sis', 'gpa-histories'] as const,
    list: (params?: GpaHistoryListParams) =>
      ['sis', 'gpa-histories', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['sis', 'gpa-histories', 'detail', id] as const,
  },
  academicTerms: {
    all: ['sis', 'academic-terms'] as const,
    list: (params?: AcademicTermListParams) =>
      ['sis', 'academic-terms', 'list', params ?? {}] as const,
  },
};

// ─── Graduation Batch hooks ──────────────────────────────────────────────────

export const useGraduationBatches = (
  params?: GraduationBatchListParams
) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduationBatches.list(params),
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<GraduationBatch>>(
        '/api/v1/sis/graduation-batches',
        { params }
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useGraduationBatch = (id: number | string | undefined) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduationBatches.detail(id ?? ''),
    queryFn: async () => {
      const response = await sisApi.get<SisDetailResponse<GraduationBatch>>(
        `/api/v1/sis/graduation-batches/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined,
    staleTime: 30000,
  });
};

export const useCreateGraduationBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GraduationBatchCreatePayload) => {
      const response = await sisApi.post<SisDetailResponse<GraduationBatch>>(
        '/api/v1/sis/graduation-batches',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationBatches.all });
    },
  });
};

export const useUpdateGraduationBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Partial<GraduationBatchCreatePayload>;
    }) => {
      const response = await sisApi.put<SisDetailResponse<GraduationBatch>>(
        `/api/v1/sis/graduation-batches/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationBatches.all });
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationBatches.detail(vars.id) });
    },
  });
};

export const useDeleteGraduationBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      await sisApi.delete(`/api/v1/sis/graduation-batches/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationBatches.all });
    },
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// Graduation Candidate (Ứng viên tốt nghiệp)
// ════════════════════════════════════════════════════════════════════════════════

export interface StudentRef {
  id: number;
  code: string;
  name: string;
  class_name?: string;
  avatar_url?: string;
}

export interface GraduationCandidate {
  id: number;
  graduation_batch_id: number;
  student_id: number;
  result: 'pending' | 'eligible' | 'ineligible' | 'approved' | 'rejected';
  gpa: number | null;
  total_credits: number | null;
  cpa: number | null;
  thesis_title: string | null;
  thesis_score: number | null;
  remark: string | null;
  decision_no: string | null;
  decision_date: string | null;
  graduated_at: string | null;
  student?: StudentRef;
  graduation_batch?: { id: number; code: string; name: string };
  academic_term?: { id: number; code: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface GraduationCandidateListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  graduation_batch_id?: number;
  student_id?: number;
  result?: string;
}

export const useGraduationCandidates = (
  params?: GraduationCandidateListParams
) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduationCandidates.list(params),
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<GraduationCandidate>>(
        '/api/v1/sis/graduation-candidates',
        { params }
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useGraduationCandidate = (
  id: number | string | undefined
) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduationCandidates.detail(id ?? ''),
    queryFn: async () => {
      const response = await sisApi.get<SisDetailResponse<GraduationCandidate>>(
        `/api/v1/sis/graduation-candidates/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined,
    staleTime: 30000,
  });
};

export const useApproveGraduationCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | string;
      payload?: {
        graduation_date?: string | null;
        degree_no?: string | null;
        certificate_no?: string | null;
        classification?: string | null;
        decision_no?: string | null;
        decision_date?: string | null;
        note?: string | null;
      };
    }) => {
      const response = await sisApi.post<{
        success: boolean;
        message: string;
        data: {
          candidate: GraduationCandidate;
          graduation: GraduationRecord;
        };
      }>(`/api/v1/sis/graduation-candidates/${id}/approve`, payload ?? {});
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationCandidates.all });
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduations.all });
    },
  });
};

export const useRejectGraduationCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      remark,
    }: {
      id: number | string;
      remark?: string | null;
    }) => {
      const response = await sisApi.post<SisDetailResponse<GraduationCandidate>>(
        `/api/v1/sis/graduation-candidates/${id}/reject`,
        remark ? { remark } : {}
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationCandidates.all });
    },
  });
};

export const useUpdateGraduationCandidate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | string;
      payload: { remark?: string | null };
    }) => {
      const response = await sisApi.put<SisDetailResponse<GraduationCandidate>>(
        `/api/v1/sis/graduation-candidates/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationCandidates.all });
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduationCandidates.detail(vars.id) });
    },
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// Graduation Record (Bằng tốt nghiệp)
// ════════════════════════════════════════════════════════════════════════════════

export interface GraduationRecord {
  id: number;
  graduation_batch_id: number;
  student_id: number;
  decision_no: string | null;
  degree_no: string | null;
  certificate_no: string | null;
  classification: 'excellent' | 'very_good' | 'good' | 'average' | null;
  graduation_date: string | null;
  decision_date: string | null;
  note: string | null;
  status: 'graduated' | 'revoked';
  student?: StudentRef;
  graduation_batch?: { id: number; code: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface GraduationRecordListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  graduation_batch_id?: number;
  student_id?: number;
  decision_no?: string;
  classification?: string;
  status?: string;
}

export interface GraduationRecordUpdatePayload {
  graduation_date?: string | null;
  degree_no?: string | null;
  certificate_no?: string | null;
  classification?: string | null;
  decision_no?: string | null;
  decision_date?: string | null;
  note?: string | null;
}

export const useGraduationRecords = (
  params?: GraduationRecordListParams
) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduations.list(params),
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<GraduationRecord>>(
        '/api/v1/sis/graduations',
        { params }
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useGraduationRecord = (
  id: number | string | undefined
) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.graduations.detail(id ?? ''),
    queryFn: async () => {
      const response = await sisApi.get<SisDetailResponse<GraduationRecord>>(
        `/api/v1/sis/graduations/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined,
    staleTime: 30000,
  });
};

export const useUpdateGraduationRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | string;
      payload: GraduationRecordUpdatePayload;
    }) => {
      const response = await sisApi.put<SisDetailResponse<GraduationRecord>>(
        `/api/v1/sis/graduations/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduations.all });
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduations.detail(vars.id) });
    },
  });
};

export const useRevokeGraduationRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: number | string;
      note?: string | null;
    }) => {
      const response = await sisApi.post<SisDetailResponse<GraduationRecord>>(
        `/api/v1/sis/graduations/${id}/revoke`,
        note ? { note } : {}
      );
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduations.all });
    },
  });
};

export const useDeleteGraduationRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      await sisApi.delete(`/api/v1/sis/graduations/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SIS_QUERY_KEYS.graduations.all });
    },
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// GPA History
// ════════════════════════════════════════════════════════════════════════════════

export interface GpaHistory {
  id: number;
  student_id: number;
  academic_term_id: number;
  semester_gpa: number;
  cumulative_gpa: number;
  registered_credit: number;
  accumulated_credit: number;
  earned_credit: number;
  academic_rank: number;
  student?: { id: number; code: string; name: string };
  academic_term?: { id: number; code: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface GpaHistoryListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  student_id?: number;
  academic_term_id?: number;
  academic_rank?: number;
}

export const useSisGpaHistories = (params?: GpaHistoryListParams) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.gpaHistories.list(params),
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<GpaHistory>>(
        '/api/v1/sis/gpa-histories',
        { params }
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useSisGpaHistory = (id: number | string | undefined) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.gpaHistories.detail(id ?? ''),
    queryFn: async () => {
      const response = await sisApi.get<SisDetailResponse<GpaHistory>>(
        `/api/v1/sis/gpa-histories/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined,
    staleTime: 30000,
  });
};

// ════════════════════════════════════════════════════════════════════════════════
// Academic Terms (Học kỳ — dùng để populate dropdown)
// ════════════════════════════════════════════════════════════════════════════════

export interface AcademicTerm {
  id: number;
  code: string;
  name: string;
  academic_year: string;
  semester: number;
  status: number;
}

export interface AcademicTermListParams {
  page?: number;
  per_page?: number;
  code?: string;
  academic_year?: string;
  semester?: number;
  status?: number;
}

export const useSisAcademicTerms = (params?: AcademicTermListParams) => {
  return useQuery({
    queryKey: SIS_QUERY_KEYS.academicTerms.list(params),
    queryFn: async () => {
      const response = await sisApi.get<SisListResponse<AcademicTerm>>(
        '/api/v1/sis/academic-terms',
        { params }
      );
      return response.data;
    },
    staleTime: 60000,
  });
};

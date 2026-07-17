// ─── HQNhat SIS API hooks (Majors / Specializations / Training Systems) ────
// All hooks use the dedicated HQNhat axios client with Bearer token from env.

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { hqnhatApi } from '@/lib/hqnhatApiClient';
import type {
  HqnhatDetailResponse,
  HqnhatListResponse,
  HqnhatMajor,
  HqnhatMajorCreatePayload,
  HqnhatMajorListParams,
  HqnhatSpecialization,
  HqnhatSpecializationCreatePayload,
  HqnhatSpecializationListParams,
  HqnhatTrainingSystem,
  HqnhatTrainingSystemCreatePayload,
  HqnhatTrainingSystemListParams,
  HqnhatAcademicTerm,
  HqnhatAcademicTermCreatePayload,
  HqnhatAcademicTermListParams,
  HqnhatCurriculum,
  HqnhatCurriculumCreatePayload,
  HqnhatCurriculumListParams,
  HqnhatCourse,
  HqnhatCourseCreatePayload,
  HqnhatCourseListParams,
  HqnhatSubjectType,
  HqnhatSubjectTypeCreatePayload,
  HqnhatSubjectTypeListParams,
  HqnhatSubject,
  HqnhatSubjectCreatePayload,
  HqnhatSubjectListParams,
  HqnhatCurriculumSubject,
  HqnhatCurriculumSubjectCreatePayload,
  HqnhatCurriculumSubjectUpdatePayload,
  HqnhatCurriculumSubjectListParams,
  HqnhatSubjectPrerequisite,
  HqnhatSubjectPrerequisiteCreatePayload,
  HqnhatSubjectPrerequisiteListParams,
  HqnhatSubjectCondition,
  HqnhatSubjectConditionCreatePayload,
  HqnhatSubjectConditionListParams,
  HqnhatAdmissionBatch,
  HqnhatAdmissionBatchCreatePayload,
  HqnhatAdmissionBatchListParams,
} from '@/types/hqnhat.types';

// ─── Query keys ──────────────────────────────────────────────────────────
export const HQNHAT_QUERY_KEYS = {
  majors: {
    all: ['hqnhat', 'majors'] as const,
    list: (params?: HqnhatMajorListParams) =>
      ['hqnhat', 'majors', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'majors', 'detail', id] as const,
  },
  specializations: {
    all: ['hqnhat', 'specializations'] as const,
    list: (params?: HqnhatSpecializationListParams) =>
      ['hqnhat', 'specializations', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'specializations', 'detail', id] as const,
  },
  trainingSystems: {
    all: ['hqnhat', 'training-systems'] as const,
    list: (params?: HqnhatTrainingSystemListParams) =>
      ['hqnhat', 'training-systems', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'training-systems', 'detail', id] as const,
  },
  academicTerms: {
    all: ['hqnhat', 'academic-terms'] as const,
    list: (params?: HqnhatAcademicTermListParams) =>
      ['hqnhat', 'academic-terms', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'academic-terms', 'detail', id] as const,
  },
  curriculums: {
    all: ['hqnhat', 'curriculums'] as const,
    list: (params?: HqnhatCurriculumListParams) =>
      ['hqnhat', 'curriculums', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'curriculums', 'detail', id] as const,
  },
  courses: {
    all: ['hqnhat', 'courses'] as const,
    list: (params?: HqnhatCourseListParams) =>
      ['hqnhat', 'courses', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'courses', 'detail', id] as const,
  },
  subjectTypes: {
    all: ['hqnhat', 'subject-types'] as const,
    list: (params?: HqnhatSubjectTypeListParams) =>
      ['hqnhat', 'subject-types', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'subject-types', 'detail', id] as const,
  },
  subjects: {
    all: ['hqnhat', 'subjects'] as const,
    list: (params?: HqnhatSubjectListParams) =>
      ['hqnhat', 'subjects', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'subjects', 'detail', id] as const,
  },
  curriculumSubjects: {
    all: ['hqnhat', 'curriculum-subjects'] as const,
    list: (params?: HqnhatCurriculumSubjectListParams) =>
      ['hqnhat', 'curriculum-subjects', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'curriculum-subjects', 'detail', id] as const,
  },
  subjectPrerequisites: {
    all: ['hqnhat', 'subject-prerequisites'] as const,
    list: (params?: HqnhatSubjectPrerequisiteListParams) =>
      ['hqnhat', 'subject-prerequisites', 'list', params ?? {}] as const,
  },
  subjectConditions: {
    all: ['hqnhat', 'subject-conditions'] as const,
    list: (params?: HqnhatSubjectConditionListParams) =>
      ['hqnhat', 'subject-conditions', 'list', params ?? {}] as const,
  },
  admissionBatches: {
    all: ['hqnhat', 'admission-batches'] as const,
    list: (params?: HqnhatAdmissionBatchListParams) =>
      ['hqnhat', 'admission-batches', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'admission-batches', 'detail', id] as const,
  },
};

// ─── Helper to strip empty / undefined params ─────────────────────────────
function cleanParams<T extends Record<string, any>>(params?: T): Record<string, any> {
  if (!params) return {};
  return Object.entries(params).reduce<Record<string, any>>((acc, [k, v]) => {
    if (v === undefined || v === null || v === '') return acc;
    acc[k] = v;
    return acc;
  }, {});
}

// ══════════════════════════════════════════════════════════════════════════
// MAJORS
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatMajors = (
  params?: HqnhatMajorListParams,
  options?: Omit<
    UseQueryOptions<HqnhatListResponse<HqnhatMajor>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<HqnhatListResponse<HqnhatMajor>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.majors.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatMajor>>(
        '/api/v1/sis/majors',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatMajor = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<HqnhatDetailResponse<HqnhatMajor>, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<HqnhatDetailResponse<HqnhatMajor>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.majors.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatMajor>>(
        `/api/v1/sis/majors/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatMajor = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatMajor>, Error, HqnhatMajorCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatMajor>, Error, HqnhatMajorCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatMajor>>(
        '/api/v1/sis/majors',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.majors.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatMajor = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatMajor>,
    Error,
    { id: number; payload: HqnhatMajorCreatePayload }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatMajor>,
    Error,
    { id: number; payload: HqnhatMajorCreatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatMajor>>(
        `/api/v1/sis/majors/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.majors.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatMajor = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/majors/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.majors.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SPECIALIZATIONS
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatSpecializations = (
  params?: HqnhatSpecializationListParams,
  options?: Omit<
    UseQueryOptions<HqnhatListResponse<HqnhatSpecialization>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<HqnhatListResponse<HqnhatSpecialization>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.specializations.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatSpecialization>>(
        '/api/v1/sis/specializations',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useHqnhatSpecialization = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<HqnhatDetailResponse<HqnhatSpecialization>, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<HqnhatDetailResponse<HqnhatSpecialization>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.specializations.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatSpecialization>>(
        `/api/v1/sis/specializations/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatSpecialization = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatSpecialization>,
    Error,
    HqnhatSpecializationCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatSpecialization>,
    Error,
    HqnhatSpecializationCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatSpecialization>>(
        '/api/v1/sis/specializations',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.specializations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatSpecialization = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatSpecialization>,
    Error,
    { id: number; payload: HqnhatSpecializationCreatePayload }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatSpecialization>,
    Error,
    { id: number; payload: HqnhatSpecializationCreatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatSpecialization>>(
        `/api/v1/sis/specializations/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.specializations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatSpecialization = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/specializations/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.specializations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// TRAINING SYSTEMS
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatTrainingSystems = (
  params?: HqnhatTrainingSystemListParams,
  options?: Omit<
    UseQueryOptions<HqnhatListResponse<HqnhatTrainingSystem>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<HqnhatListResponse<HqnhatTrainingSystem>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.trainingSystems.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatTrainingSystem>>(
        '/api/v1/sis/training-systems',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatTrainingSystem = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<HqnhatDetailResponse<HqnhatTrainingSystem>, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<HqnhatDetailResponse<HqnhatTrainingSystem>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.trainingSystems.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatTrainingSystem>>(
        `/api/v1/sis/training-systems/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatTrainingSystem = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatTrainingSystem>,
    Error,
    HqnhatTrainingSystemCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatTrainingSystem>,
    Error,
    HqnhatTrainingSystemCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatTrainingSystem>>(
        '/api/v1/sis/training-systems',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.trainingSystems.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatTrainingSystem = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatTrainingSystem>,
    Error,
    { id: number; payload: HqnhatTrainingSystemCreatePayload }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatTrainingSystem>,
    Error,
    { id: number; payload: HqnhatTrainingSystemCreatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatTrainingSystem>>(
        `/api/v1/sis/training-systems/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.trainingSystems.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatTrainingSystem = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/training-systems/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.trainingSystems.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// ACADEMIC TERMS (Học kỳ)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatAcademicTerms = (
  params?: HqnhatAcademicTermListParams,
  options?: Omit<
    UseQueryOptions<HqnhatListResponse<HqnhatAcademicTerm>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<HqnhatListResponse<HqnhatAcademicTerm>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.academicTerms.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatAcademicTerm>>(
        '/api/v1/sis/academic-terms',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useHqnhatAcademicTerm = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<HqnhatDetailResponse<HqnhatAcademicTerm>, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<HqnhatDetailResponse<HqnhatAcademicTerm>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.academicTerms.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatAcademicTerm>>(
        `/api/v1/sis/academic-terms/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatAcademicTerm = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatAcademicTerm>,
    Error,
    HqnhatAcademicTermCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatAcademicTerm>,
    Error,
    HqnhatAcademicTermCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatAcademicTerm>>(
        '/api/v1/sis/academic-terms',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.academicTerms.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatAcademicTerm = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatAcademicTerm>,
    Error,
    { id: number; payload: HqnhatAcademicTermCreatePayload }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatAcademicTerm>,
    Error,
    { id: number; payload: HqnhatAcademicTermCreatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatAcademicTerm>>(
        `/api/v1/sis/academic-terms/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.academicTerms.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatAcademicTerm = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/academic-terms/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.academicTerms.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// CURRICULUMS (Chương trình đào tạo)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatCurriculums = (
  params?: HqnhatCurriculumListParams,
  options?: Omit<
    UseQueryOptions<HqnhatListResponse<HqnhatCurriculum>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<HqnhatListResponse<HqnhatCurriculum>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.curriculums.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatCurriculum>>(
        '/api/v1/sis/curriculums',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useHqnhatCurriculum = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<HqnhatDetailResponse<HqnhatCurriculum>, Error>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) =>
  useQuery<HqnhatDetailResponse<HqnhatCurriculum>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.curriculums.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatCurriculum>>(
        `/api/v1/sis/curriculums/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatCurriculum = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatCurriculum>,
    Error,
    HqnhatCurriculumCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatCurriculum>,
    Error,
    HqnhatCurriculumCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatCurriculum>>(
        '/api/v1/sis/curriculums',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculums.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatCurriculum = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<HqnhatCurriculum>,
    Error,
    { id: number; payload: HqnhatCurriculumCreatePayload }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<HqnhatCurriculum>,
    Error,
    { id: number; payload: HqnhatCurriculumCreatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatCurriculum>>(
        `/api/v1/sis/curriculums/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculums.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatCurriculum = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/curriculums/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculums.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// COURSES (Khóa học / Khóa sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatCourses = (
  params?: HqnhatCourseListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatCourse>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatCourse>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courses.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatCourse>>(
        '/api/v1/sis/courses',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatCourse = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatCourse>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatCourse>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courses.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatCourse>>(
        `/api/v1/sis/courses/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatCourse = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCourse>, Error, HqnhatCourseCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCourse>, Error, HqnhatCourseCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatCourse>>(
        '/api/v1/sis/courses',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courses.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatCourse = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCourse>, Error, { id: number; payload: HqnhatCourseCreatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCourse>, Error, { id: number; payload: HqnhatCourseCreatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatCourse>>(
        `/api/v1/sis/courses/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courses.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatCourse = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/courses/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courses.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT TYPES (Nhóm môn học)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatSubjectTypes = (
  params?: HqnhatSubjectTypeListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatSubjectType>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatSubjectType>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjectTypes.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatSubjectType>>(
        '/api/v1/sis/subject-types',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatSubjectType = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatSubjectType>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatSubjectType>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjectTypes.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatSubjectType>>(
        `/api/v1/sis/subject-types/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatSubjectType = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubjectType>, Error, HqnhatSubjectTypeCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubjectType>, Error, HqnhatSubjectTypeCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatSubjectType>>(
        '/api/v1/sis/subject-types',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectTypes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatSubjectType = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubjectType>, Error, { id: number; payload: HqnhatSubjectTypeCreatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubjectType>, Error, { id: number; payload: HqnhatSubjectTypeCreatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatSubjectType>>(
        `/api/v1/sis/subject-types/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectTypes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatSubjectType = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/subject-types/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectTypes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SUBJECTS (Môn học)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatSubjects = (
  params?: HqnhatSubjectListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatSubject>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatSubject>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjects.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatSubject>>(
        '/api/v1/sis/subjects',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatSubject = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatSubject>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatSubject>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjects.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatSubject>>(
        `/api/v1/sis/subjects/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatSubject = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubject>, Error, HqnhatSubjectCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubject>, Error, HqnhatSubjectCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatSubject>>(
        '/api/v1/sis/subjects',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatSubject = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubject>, Error, { id: number; payload: HqnhatSubjectCreatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubject>, Error, { id: number; payload: HqnhatSubjectCreatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatSubject>>(
        `/api/v1/sis/subjects/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatSubject = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/subjects/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// CURRICULUM SUBJECTS (Môn học trong CTĐT - quan hệ N-N)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatCurriculumSubjects = (
  params?: HqnhatCurriculumSubjectListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatCurriculumSubject>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatCurriculumSubject>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.curriculumSubjects.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatCurriculumSubject>>(
        '/api/v1/sis/curriculum-subjects',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatCurriculumSubject = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.curriculumSubjects.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatCurriculumSubject>>(
        `/api/v1/sis/curriculum-subjects/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatCurriculumSubject = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error, HqnhatCurriculumSubjectCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error, HqnhatCurriculumSubjectCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatCurriculumSubject>>(
        '/api/v1/sis/curriculum-subjects',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculumSubjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatCurriculumSubject = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error, { id: number; payload: HqnhatCurriculumSubjectUpdatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCurriculumSubject>, Error, { id: number; payload: HqnhatCurriculumSubjectUpdatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatCurriculumSubject>>(
        `/api/v1/sis/curriculum-subjects/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculumSubjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatCurriculumSubject = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/curriculum-subjects/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.curriculumSubjects.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT PREREQUISITES (Tiên quyết học phần)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatSubjectPrerequisites = (
  params?: HqnhatSubjectPrerequisiteListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatSubjectPrerequisite>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatSubjectPrerequisite>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjectPrerequisites.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatSubjectPrerequisite>>(
        '/api/v1/sis/subject-prerequisites',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatSubjectPrerequisite = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, HqnhatSubjectPrerequisiteCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, HqnhatSubjectPrerequisiteCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<{ success: boolean; message: string }>(
        '/api/v1/sis/subject-prerequisites',
        payload
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectPrerequisites.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatSubjectPrerequisite = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, { id: number; payload: HqnhatSubjectPrerequisiteCreatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, { id: number; payload: HqnhatSubjectPrerequisiteCreatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<{ success: boolean; message: string }>(
        `/api/v1/sis/subject-prerequisites/${id}`,
        payload
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectPrerequisites.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatSubjectPrerequisite = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/subject-prerequisites/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectPrerequisites.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SUBJECT CONDITIONS (Điều kiện học phần)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatSubjectConditions = (
  params?: HqnhatSubjectConditionListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatSubjectCondition>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatSubjectCondition>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.subjectConditions.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatSubjectCondition>>(
        '/api/v1/sis/subject-conditions',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatSubjectCondition = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatSubjectCondition>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatSubjectCondition>, Error>({
    queryKey: [...HQNHAT_QUERY_KEYS.subjectConditions.all, id],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatSubjectCondition>>(
        `/api/v1/sis/subject-conditions/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatSubjectCondition = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubjectCondition>, Error, HqnhatSubjectConditionCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubjectCondition>, Error, HqnhatSubjectConditionCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatSubjectCondition>>(
        '/api/v1/sis/subject-conditions',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectConditions.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatSubjectCondition = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatSubjectCondition>, Error, { id: number; payload: Partial<HqnhatSubjectConditionCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatSubjectCondition>, Error, { id: number; payload: Partial<HqnhatSubjectConditionCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatSubjectCondition>>(
        `/api/v1/sis/subject-conditions/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectConditions.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatSubjectCondition = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/subject-conditions/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.subjectConditions.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// ADMISSION BATCHES (Đợt tuyển sinh)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatAdmissionBatches = (
  params?: HqnhatAdmissionBatchListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatAdmissionBatch>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatAdmissionBatch>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.admissionBatches.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatAdmissionBatch>>(
        '/api/v1/sis/admission-batches',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatAdmissionBatch = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.admissionBatches.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatAdmissionBatch>>(
        `/api/v1/sis/admission-batches/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatAdmissionBatch = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error, HqnhatAdmissionBatchCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error, HqnhatAdmissionBatchCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatAdmissionBatch>>(
        '/api/v1/sis/admission-batches',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionBatches.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatAdmissionBatch = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error, { id: number; payload: Partial<HqnhatAdmissionBatchCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatAdmissionBatch>, Error, { id: number; payload: Partial<HqnhatAdmissionBatchCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatAdmissionBatch>>(
        `/api/v1/sis/admission-batches/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionBatches.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatAdmissionBatch = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/admission-batches/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionBatches.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

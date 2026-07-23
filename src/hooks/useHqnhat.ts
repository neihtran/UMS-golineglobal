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
  HqnhatAdmissionStudent,
  HqnhatAdmissionStudentCreatePayload,
  HqnhatAdmissionStudentListParams,
  HqnhatStudent,
  HqnhatStudentCreatePayload,
  HqnhatStudentListParams,
  HqnhatCourseSection,
  HqnhatCourseSectionCreatePayload,
  HqnhatCourseSectionListParams,
  HqnhatClassSchedule,
  HqnhatClassScheduleCreatePayload,
  HqnhatClassScheduleListParams,
  HqnhatScheduleChange,
  HqnhatScheduleChangeCreatePayload,
  HqnhatScheduleChangeListParams,
  HqnhatCourseRegistration,
  HqnhatCourseRegistrationCreatePayload,
  HqnhatCourseRegistrationListParams,
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
  admissionStudents: {
    all: ['hqnhat', 'admission-students'] as const,
    list: (params?: HqnhatAdmissionStudentListParams) =>
      ['hqnhat', 'admission-students', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'admission-students', 'detail', id] as const,
  },
  students: {
    all: ['hqnhat', 'students'] as const,
    list: (params?: HqnhatStudentListParams) =>
      ['hqnhat', 'students', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'students', 'detail', id] as const,
  },
  courseSections: {
    all: ['hqnhat', 'course-sections'] as const,
    list: (params?: HqnhatCourseSectionListParams) =>
      ['hqnhat', 'course-sections', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'course-sections', 'detail', id] as const,
    students: (id: number | string, params?: { page?: number; per_page?: number; status?: number }) =>
      ['hqnhat', 'course-sections', String(id), 'students', params ?? {}] as const,
  },
  classSchedules: {
    all: ['hqnhat', 'class-schedules'] as const,
    list: (params?: HqnhatClassScheduleListParams) =>
      ['hqnhat', 'class-schedules', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'class-schedules', 'detail', id] as const,
  },
  scheduleChanges: {
    all: ['hqnhat', 'schedule-changes'] as const,
    list: (params?: HqnhatScheduleChangeListParams) =>
      ['hqnhat', 'schedule-changes', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'schedule-changes', 'detail', id] as const,
  },
  courseRegistrations: {
    all: ['hqnhat', 'course-registrations'] as const,
    list: (params?: HqnhatCourseRegistrationListParams) =>
      ['hqnhat', 'course-registrations', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'course-registrations', 'detail', id] as const,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
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

// ══════════════════════════════════════════════════════════════════════════
// ADMISSION STUDENTS (Thí sinh trúng tuyển)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatAdmissionStudents = (
  params?: HqnhatAdmissionStudentListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatAdmissionStudent>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatAdmissionStudent>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.admissionStudents.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatAdmissionStudent>>(
        '/api/v1/sis/admission-students',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatAdmissionStudent = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.admissionStudents.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatAdmissionStudent>>(
        `/api/v1/sis/admission-students/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatAdmissionStudent = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error, HqnhatAdmissionStudentCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error, HqnhatAdmissionStudentCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatAdmissionStudent>>(
        '/api/v1/sis/admission-students',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionStudents.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatAdmissionStudent = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error, { id: number; payload: Partial<HqnhatAdmissionStudentCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatAdmissionStudent>, Error, { id: number; payload: Partial<HqnhatAdmissionStudentCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatAdmissionStudent>>(
        `/api/v1/sis/admission-students/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionStudents.all });
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.students.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatAdmissionStudent = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/admission-students/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.admissionStudents.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENTS (Sinh viên chính thức)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudents = (
  params?: HqnhatStudentListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatStudent>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatStudent>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.students.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatStudent>>(
        '/api/v1/sis/students',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatStudent = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatStudent>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatStudent>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.students.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatStudent>>(
        `/api/v1/sis/students/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatStudent = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatStudent>, Error, HqnhatStudentCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatStudent>, Error, HqnhatStudentCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatStudent>>(
        '/api/v1/sis/students',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.students.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatStudent = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatStudent>, Error, { id: number; payload: Partial<HqnhatStudentCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatStudent>, Error, { id: number; payload: Partial<HqnhatStudentCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatStudent>>(
        `/api/v1/sis/students/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.students.all });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-reservations'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-dropouts'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-major-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-class-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-status-histories'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudent = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/students/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.students.all });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-reservations'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-dropouts'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-major-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-class-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-status-histories'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT STATUS HISTORIES
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentStatusHistories = (
  params?: import('@/types/hqnhat.types').HqnhatStudentStatusHistoryListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error>({
    queryKey: ['hqnhat', 'student-status-histories', 'list', cleanParams(params)],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>>(
        '/api/v1/sis/student-status-histories',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatStudentStatusHistory = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentStatusHistoryCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentStatusHistoryCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>>(
        '/api/v1/sis/student-status-histories',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-status-histories'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT RESERVATIONS
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentReservations = (
  params?: import('@/types/hqnhat.types').HqnhatStudentReservationListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>, Error>({
    queryKey: ['hqnhat', 'student-reservations', 'list', cleanParams(params)],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>>(
        '/api/v1/sis/student-reservations',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatStudentReservation = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentReservationCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentReservationCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>>(
        '/api/v1/sis/student-reservations',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-reservations'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatStudentReservation = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentReservationCreatePayload> }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentReservationCreatePayload> }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>>(
        `/api/v1/sis/student-reservations/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-reservations'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudentReservation = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/student-reservations/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-reservations'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT DROPOUTS
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentDropouts = (
  params?: import('@/types/hqnhat.types').HqnhatStudentDropoutListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>, Error>({
    queryKey: ['hqnhat', 'student-dropouts', 'list', cleanParams(params)],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>>(
        '/api/v1/sis/student-dropouts',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatStudentDropout = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentDropoutCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentDropoutCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>>(
        '/api/v1/sis/student-dropouts',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-dropouts'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatStudentDropout = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentDropoutCreatePayload> }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentDropoutCreatePayload> }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>>(
        `/api/v1/sis/student-dropouts/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-dropouts'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudentDropout = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/student-dropouts/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-dropouts'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT MAJOR CHANGES
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentMajorChanges = (
  params?: import('@/types/hqnhat.types').HqnhatStudentMajorChangeListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>, Error>({
    queryKey: ['hqnhat', 'student-major-changes', 'list', cleanParams(params)],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>>(
        '/api/v1/sis/student-major-changes',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatStudentMajorChange = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentMajorChangeCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentMajorChangeCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>>(
        '/api/v1/sis/student-major-changes',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-major-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatStudentMajorChange = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentMajorChangeCreatePayload> }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentMajorChangeCreatePayload> }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>>(
        `/api/v1/sis/student-major-changes/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-major-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudentMajorChange = (
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message?: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message?: string }>(
        `/api/v1/sis/student-major-changes/${id}`
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-major-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT CLASS CHANGES
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentClassChanges = (
  params?: import('@/types/hqnhat.types').HqnhatStudentClassChangeListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>, Error>({
    queryKey: ['hqnhat', 'student-class-changes', 'list', cleanParams(params)],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>>(
        '/api/v1/sis/student-class-changes',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useCreateHqnhatStudentClassChange = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentClassChangeCreatePayload
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>,
    Error,
    import('@/types/hqnhat.types').HqnhatStudentClassChangeCreatePayload
  >({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>>(
        '/api/v1/sis/student-class-changes',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-class-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatStudentClassChange = (
  options?: UseMutationOptions<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentClassChangeCreatePayload> }
  >
) => {
  const qc = useQueryClient();
  return useMutation<
    HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>,
    Error,
    { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentClassChangeCreatePayload> }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>>(
        `/api/v1/sis/student-class-changes/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-class-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudentClassChange = (
  options?: UseMutationOptions<{ success: boolean; message?: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message?: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message?: string }>(
        `/api/v1/sis/student-class-changes/${id}`
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-class-changes'] });
      qc.invalidateQueries({ queryKey: ['hqnhat', 'students'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// COURSE SECTIONS (Lớp học phần)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatCourseSections = (
  params?: HqnhatCourseSectionListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatCourseSection>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatCourseSection>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courseSections.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatCourseSection>>(
        '/api/v1/sis/course-sections',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatCourseSection = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatCourseSection>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatCourseSection>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courseSections.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatCourseSection>>(
        `/api/v1/sis/course-sections/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useHqnhatCourseSectionStudents = (
  courseSectionId: number | string | undefined,
  params?: { page?: number; per_page?: number; status?: number },
  options?: Omit<UseQueryOptions<HqnhatListResponse<{ id: number; student_code: string; full_name: string }>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatListResponse<{ id: number; student_code: string; full_name: string }>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courseSections.students(courseSectionId ?? '', params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<{ id: number; student_code: string; full_name: string }>>(
        `/api/v1/sis/course-sections/${courseSectionId}/students`,
        { params: cleanParams(params) }
      );
      return res.data;
    },
    enabled: courseSectionId !== undefined && courseSectionId !== '',
    ...options,
  });

export const useCreateHqnhatCourseSection = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCourseSection>, Error, HqnhatCourseSectionCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCourseSection>, Error, HqnhatCourseSectionCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatCourseSection>>(
        '/api/v1/sis/course-sections',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseSections.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatCourseSection = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCourseSection>, Error, { id: number; payload: HqnhatCourseSectionCreatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCourseSection>, Error, { id: number; payload: HqnhatCourseSectionCreatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatCourseSection>>(
        `/api/v1/sis/course-sections/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseSections.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatCourseSection = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/course-sections/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseSections.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// CLASS SCHEDULES (Thời khóa biểu)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatClassSchedules = (
  params?: HqnhatClassScheduleListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatClassSchedule>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatClassSchedule>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.classSchedules.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatClassSchedule>>(
        '/api/v1/sis/class-schedules',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatClassSchedule = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatClassSchedule>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatClassSchedule>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.classSchedules.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatClassSchedule>>(
        `/api/v1/sis/class-schedules/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatClassSchedule = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatClassSchedule>, Error, HqnhatClassScheduleCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatClassSchedule>, Error, HqnhatClassScheduleCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatClassSchedule>>(
        '/api/v1/sis/class-schedules',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.classSchedules.all });
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatClassSchedule = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatClassSchedule>, Error, { id: number; payload: Partial<HqnhatClassScheduleCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatClassSchedule>, Error, { id: number; payload: Partial<HqnhatClassScheduleCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatClassSchedule>>(
        `/api/v1/sis/class-schedules/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.classSchedules.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatClassSchedule = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/class-schedules/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.classSchedules.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SCHEDULE CHANGES (Lịch sử thay đổi lịch học)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatScheduleChanges = (
  params?: HqnhatScheduleChangeListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatScheduleChange>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatScheduleChange>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatScheduleChange>>(
        '/api/v1/sis/schedule-changes',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatScheduleChange = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatScheduleChange>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatScheduleChange>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatScheduleChange>>(
        `/api/v1/sis/schedule-changes/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatScheduleChange = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatScheduleChange>, Error, HqnhatScheduleChangeCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatScheduleChange>, Error, HqnhatScheduleChangeCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatScheduleChange>>(
        '/api/v1/sis/schedule-changes',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.all });
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.classSchedules.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatScheduleChange = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatScheduleChange>, Error, { id: number; payload: Partial<HqnhatScheduleChangeCreatePayload> & { status?: 0 | 1 | 2 } }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatScheduleChange>, Error, { id: number; payload: Partial<HqnhatScheduleChangeCreatePayload> & { status?: 0 | 1 | 2 } }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<HqnhatScheduleChange>>(
        `/api/v1/sis/schedule-changes/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatScheduleChange = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/schedule-changes/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.scheduleChanges.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// COURSE REGISTRATIONS (Đăng ký học phần của sinh viên)
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatCourseRegistrations = (
  params?: HqnhatCourseRegistrationListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<HqnhatCourseRegistration>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<HqnhatCourseRegistration>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courseRegistrations.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<HqnhatCourseRegistration>>(
        '/api/v1/sis/course-registrations',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatCourseRegistration = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<HqnhatCourseRegistration>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<HqnhatCourseRegistration>, Error>({
    queryKey: HQNHAT_QUERY_KEYS.courseRegistrations.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<HqnhatCourseRegistration>>(
        `/api/v1/sis/course-registrations/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatCourseRegistration = (
  options?: UseMutationOptions<HqnhatDetailResponse<HqnhatCourseRegistration>, Error, HqnhatCourseRegistrationCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<HqnhatCourseRegistration>, Error, HqnhatCourseRegistrationCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<HqnhatCourseRegistration>>(
        '/api/v1/sis/course-registrations',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseRegistrations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatCourseRegistration = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/course-registrations/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseRegistrations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// SYNC COURSE REGISTRATIONS (Đồng bộ đăng ký học phần)
// ══════════════════════════════════════════════════════════════════════════
export const useSyncCourseRegistrations = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, void>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: async () => {
      const res = await hqnhatApi.post<{ success: boolean; message: string }>(
        '/api/v1/sis/course-registrations/sync'
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS.courseRegistrations.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// CLASSES (Lớp hành chính)
// ══════════════════════════════════════════════════════════════════════════
export const HQNHAT_QUERY_KEYS_EXTRA = {
  ...HQNHAT_QUERY_KEYS,
  classes: {
    all: ['hqnhat', 'classes'] as const,
    list: (params?: import('@/types/hqnhat.types').HqnhatClassListParams) =>
      ['hqnhat', 'classes', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'classes', 'detail', id] as const,
  },
  academicWarnings: {
    all: ['hqnhat', 'academic-warnings'] as const,
    list: (params?: import('@/types/hqnhat.types').HqnhatAcademicWarningListParams) =>
      ['hqnhat', 'academic-warnings', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'academic-warnings', 'detail', id] as const,
  },
  studentGrades: {
    all: ['hqnhat', 'student-grades'] as const,
    list: (params?: import('@/types/hqnhat.types').HqnhatStudentGradeListParams) =>
      ['hqnhat', 'student-grades', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'student-grades', 'detail', id] as const,
  },
  gpaHistories: {
    all: ['hqnhat', 'gpa-histories'] as const,
    list: (params?: import('@/types/hqnhat.types').HqnhatGpaHistoryListParams) =>
      ['hqnhat', 'gpa-histories', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'gpa-histories', 'detail', id] as const,
  },
  studentLogs: {
    all: ['hqnhat', 'student-logs'] as const,
    list: (params?: import('@/types/hqnhat.types').HqnhatStudentLogListParams) =>
      ['hqnhat', 'student-logs', 'list', params ?? {}] as const,
  },
  studentProfiles: {
    all: ['hqnhat', 'student-profiles'] as const,
    detail: (id: number | string) =>
      ['hqnhat', 'student-profiles', 'detail', id] as const,
  },
};

// ══════════════════════════════════════════════════════════════════════════
// CLASSES — CRUD
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatClasses = (
  params?: import('@/types/hqnhat.types').HqnhatClassListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatClass>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatClass>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.classes.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatClass>>(
        '/api/v1/sis/classes',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatClass = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.classes.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>>(
        `/api/v1/sis/classes/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatClass = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error, import('@/types/hqnhat.types').HqnhatClassCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error, import('@/types/hqnhat.types').HqnhatClassCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>>(
        '/api/v1/sis/classes',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.classes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatClass = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error, { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatClassCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>, Error, { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatClassCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatClass>>(
        `/api/v1/sis/classes/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.classes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatClass = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/classes/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.classes.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// ACADEMIC WARNINGS — CRUD
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatAcademicWarnings = (
  params?: import('@/types/hqnhat.types').HqnhatAcademicWarningListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.academicWarnings.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>>(
        '/api/v1/sis/academic-warnings',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatAcademicWarning = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.academicWarnings.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>>(
        `/api/v1/sis/academic-warnings/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useCreateHqnhatAcademicWarning = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error, import('@/types/hqnhat.types').HqnhatAcademicWarningCreatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error, import('@/types/hqnhat.types').HqnhatAcademicWarningCreatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.post<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>>(
        '/api/v1/sis/academic-warnings',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.academicWarnings.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateHqnhatAcademicWarning = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatAcademicWarningUpdatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatAcademicWarningUpdatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatAcademicWarning>>(
        `/api/v1/sis/academic-warnings/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.academicWarnings.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatAcademicWarning = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/academic-warnings/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.academicWarnings.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// STUDENT GRADES — CRUD
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentGrades = (
  params?: import('@/types/hqnhat.types').HqnhatStudentGradeListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentGrades.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>>(
        '/api/v1/sis/student-grades',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatStudentGrade = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentGrades.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>>(
        `/api/v1/sis/student-grades/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useUpdateHqnhatStudentGrade = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatStudentGradeUpdatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatStudentGradeUpdatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentGrade>>(
        `/api/v1/sis/student-grades/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentGrades.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useBulkUpdateHqnhatStudentGrades = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, import('@/types/hqnhat.types').HqnhatStudentGradeBulkUpdatePayload>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, import('@/types/hqnhat.types').HqnhatStudentGradeBulkUpdatePayload>({
    mutationFn: async (payload) => {
      const res = await hqnhatApi.put<{ success: boolean; message: string }>(
        '/api/v1/sis/student-grades/bulk-update',
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentGrades.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// GPA HISTORIES — Read-only
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatGpaHistories = (
  params?: import('@/types/hqnhat.types').HqnhatGpaHistoryListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.gpaHistories.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>>(
        '/api/v1/sis/gpa-histories',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

export const useHqnhatGpaHistory = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.gpaHistories.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatGpaHistory>>(
        `/api/v1/sis/gpa-histories/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

// ══════════════════════════════════════════════════════════════════════════
// STUDENT LOGS — Read-only
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentLogs = (
  params?: import('@/types/hqnhat.types').HqnhatStudentLogListParams,
  options?: Omit<UseQueryOptions<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentLog>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentLog>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentLogs.list(params),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatListResponse<import('@/types/hqnhat.types').HqnhatStudentLog>>(
        '/api/v1/sis/student-logs',
        { params: cleanParams(params) }
      );
      return res.data;
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    ...options,
  });

// ══════════════════════════════════════════════════════════════════════════
// STUDENT PROFILES — Read/Update
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentProfile = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>, Error>({
    queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentProfiles.detail(id ?? ''),
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>>(
        `/api/v1/sis/student-profiles/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useUpdateHqnhatStudentProfile = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatStudentProfileUpdatePayload }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>, Error, { id: number; payload: import('@/types/hqnhat.types').HqnhatStudentProfileUpdatePayload }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentProfile>>(
        `/api/v1/sis/student-profiles/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: HQNHAT_QUERY_KEYS_EXTRA.studentProfiles.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// DETAIL HOOKS còn thiếu cho 5 entity
// ══════════════════════════════════════════════════════════════════════════
export const useHqnhatStudentStatusHistory = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error>({
    queryKey: ['hqnhat', 'student-status-histories', 'detail', id ?? ''],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>>(
        `/api/v1/sis/student-status-histories/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useUpdateHqnhatStudentStatusHistory = (
  options?: UseMutationOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error, { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentStatusHistoryCreatePayload> }>
) => {
  const qc = useQueryClient();
  return useMutation<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>, Error, { id: number; payload: Partial<import('@/types/hqnhat.types').HqnhatStudentStatusHistoryCreatePayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await hqnhatApi.put<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentStatusHistory>>(
        `/api/v1/sis/student-status-histories/${id}`,
        payload
      );
      return res.data;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-status-histories'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteHqnhatStudentStatusHistory = (
  options?: UseMutationOptions<{ success: boolean; message: string }, Error, number>
) => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; message: string }, Error, number>({
    mutationFn: async (id) => {
      const res = await hqnhatApi.delete<{ success: boolean; message: string }>(
        `/api/v1/sis/student-status-histories/${id}`
      );
      return res.data as any;
    },
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['hqnhat', 'student-status-histories'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useHqnhatStudentReservation = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>, Error>({
    queryKey: ['hqnhat', 'student-reservations', 'detail', id ?? ''],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentReservation>>(
        `/api/v1/sis/student-reservations/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useHqnhatStudentDropout = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>, Error>({
    queryKey: ['hqnhat', 'student-dropouts', 'detail', id ?? ''],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentDropout>>(
        `/api/v1/sis/student-dropouts/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useHqnhatStudentMajorChange = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>, Error>({
    queryKey: ['hqnhat', 'student-major-changes', 'detail', id ?? ''],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentMajorChange>>(
        `/api/v1/sis/student-major-changes/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

export const useHqnhatStudentClassChange = (
  id: number | string | undefined,
  options?: Omit<UseQueryOptions<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>, Error>({
    queryKey: ['hqnhat', 'student-class-changes', 'detail', id ?? ''],
    queryFn: async () => {
      const res = await hqnhatApi.get<HqnhatDetailResponse<import('@/types/hqnhat.types').HqnhatStudentClassChange>>(
        `/api/v1/sis/student-class-changes/${id}`
      );
      return res.data;
    },
    enabled: id !== undefined && id !== '',
    ...options,
  });

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
// ─── Core API Hooks ─────────────────────────────────────────────────────────────
// TanStack Query hooks for Core Module API

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { coreApi } from '@/lib/coreApiClient';
import type {
  Organization,
  OrganizationListParams,
  OrganizationCreatePayload,
  Campus,
  CampusListParams,
  CampusCreatePayload,
  Faculty,
  FacultyListParams,
  FacultyCreatePayload,
  Department,
  DepartmentListParams,
  DepartmentCreatePayload,
  Division,
  DivisionListParams,
  DivisionCreatePayload,
  Building,
  BuildingListParams,
  BuildingCreatePayload,
  Floor,
  FloorListParams,
  FloorCreatePayload,
  RoomType,
  RoomTypeListParams,
  RoomTypeCreatePayload,
  Room,
  RoomListParams,
  RoomCreatePayload,
  AcademicYear,
  AcademicYearListParams,
  AcademicYearCreatePayload,
  Semester,
  SemesterListParams,
  SemesterCreatePayload,
  MasterGroup,
  MasterGroupListParams,
  MasterGroupCreatePayload,
  MasterValue,
  MasterValueListParams,
  MasterValueCreatePayload,
  Country,
  CountryListParams,
  CountryCreatePayload,
  Province,
  ProvinceListParams,
  ProvinceCreatePayload,
  District,
  DistrictListParams,
  DistrictCreatePayload,
  Ward,
  WardListParams,
  WardCreatePayload,
  CoreListResponse,
  CoreDetailResponse,
} from '@/types/core.types';

// ─── Query keys ────────────────────────────────────────────────────────────────
export const CORE_QUERY_KEYS = {
  organizations: {
    all: ['core', 'organizations'] as const,
    list: (params?: OrganizationListParams) =>
      ['core', 'organizations', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'organizations', 'detail', id] as const,
  },
  campuses: {
    all: ['core', 'campuses'] as const,
    list: (params?: CampusListParams) =>
      ['core', 'campuses', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'campuses', 'detail', id] as const,
  },
  faculties: {
    all: ['core', 'faculties'] as const,
    list: (params?: FacultyListParams) =>
      ['core', 'faculties', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'faculties', 'detail', id] as const,
  },
  departments: {
    all: ['core', 'departments'] as const,
    list: (params?: DepartmentListParams) =>
      ['core', 'departments', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'departments', 'detail', id] as const,
  },
  divisions: {
    all: ['core', 'divisions'] as const,
    list: (params?: DivisionListParams) =>
      ['core', 'divisions', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'divisions', 'detail', id] as const,
  },
  buildings: {
    all: ['core', 'buildings'] as const,
    list: (params?: BuildingListParams) =>
      ['core', 'buildings', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'buildings', 'detail', id] as const,
  },
  floors: {
    all: ['core', 'floors'] as const,
    list: (params?: FloorListParams) =>
      ['core', 'floors', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'floors', 'detail', id] as const,
  },
  roomTypes: {
    all: ['core', 'room-types'] as const,
    list: (params?: RoomTypeListParams) =>
      ['core', 'room-types', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'room-types', 'detail', id] as const,
  },
  rooms: {
    all: ['core', 'rooms'] as const,
    list: (params?: RoomListParams) =>
      ['core', 'rooms', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'rooms', 'detail', id] as const,
  },
  academicYears: {
    all: ['core', 'academic-years'] as const,
    list: (params?: AcademicYearListParams) =>
      ['core', 'academic-years', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'academic-years', 'detail', id] as const,
  },
  semesters: {
    all: ['core', 'semesters'] as const,
    list: (params?: SemesterListParams) =>
      ['core', 'semesters', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'semesters', 'detail', id] as const,
  },
  masterGroups: {
    all: ['core', 'master-groups'] as const,
    list: (params?: MasterGroupListParams) =>
      ['core', 'master-groups', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'master-groups', 'detail', id] as const,
  },
  masterValues: {
    all: ['core', 'master-values'] as const,
    list: (params?: MasterValueListParams) =>
      ['core', 'master-values', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'master-values', 'detail', id] as const,
  },
  countries: {
    all: ['core', 'countries'] as const,
    list: (params?: CountryListParams) =>
      ['core', 'countries', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'countries', 'detail', id] as const,
  },
  provinces: {
    all: ['core', 'provinces'] as const,
    list: (params?: ProvinceListParams) =>
      ['core', 'provinces', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'provinces', 'detail', id] as const,
  },
  districts: {
    all: ['core', 'districts'] as const,
    list: (params?: DistrictListParams) =>
      ['core', 'districts', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'districts', 'detail', id] as const,
  },
  wards: {
    all: ['core', 'wards'] as const,
    list: (params?: WardListParams) =>
      ['core', 'wards', 'list', params ?? {}] as const,
    detail: (id: number | string) =>
      ['core', 'wards', 'detail', id] as const,
  },
};

// ─── Organization hooks ─────────────────────────────────────────────────────────
export const useOrganizations = (
  params?: OrganizationListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.organizations.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Organization>>(
        '/api/v1/core/organizations',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useOrganization = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.organizations.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Organization>>(
        `/api/v1/core/organizations/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OrganizationCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Organization>>(
        '/api/v1/core/organizations',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.organizations.all });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<OrganizationCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Organization>>(
        `/api/v1/core/organizations/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.organizations.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.organizations.detail(id) });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/organizations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.organizations.all });
    },
  });
};

// ─── Campus hooks ──────────────────────────────────────────────────────────────
export const useCampuses = (
  params?: CampusListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.campuses.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Campus>>(
        '/api/v1/core/campuses',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useCampus = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.campuses.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Campus>>(
        `/api/v1/core/campuses/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CampusCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Campus>>(
        '/api/v1/core/campuses',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.campuses.all });
    },
  });
};

export const useUpdateCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CampusCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Campus>>(
        `/api/v1/core/campuses/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.campuses.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.campuses.detail(id) });
    },
  });
};

export const useDeleteCampus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/campuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.campuses.all });
    },
  });
};

// ─── Faculty hooks ──────────────────────────────────────────────────────────────
export const useFaculties = (
  params?: FacultyListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.faculties.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Faculty>>(
        '/api/v1/core/faculties',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useFaculty = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.faculties.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Faculty>>(
        `/api/v1/core/faculties/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FacultyCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Faculty>>(
        '/api/v1/core/faculties',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.faculties.all });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<FacultyCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Faculty>>(
        `/api/v1/core/faculties/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.faculties.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.faculties.detail(id) });
    },
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/faculties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.faculties.all });
    },
  });
};

// ─── Department hooks ──────────────────────────────────────────────────────────
export const useDepartments = (
  params?: DepartmentListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.departments.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Department>>(
        '/api/v1/core/departments',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useDepartment = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.departments.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Department>>(
        `/api/v1/core/departments/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DepartmentCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Department>>(
        '/api/v1/core/departments',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.departments.all });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<DepartmentCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Department>>(
        `/api/v1/core/departments/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.departments.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.departments.detail(id) });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.departments.all });
    },
  });
};

// ─── Division hooks ─────────────────────────────────────────────────────────────
export const useDivisions = (
  params?: DivisionListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.divisions.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Division>>(
        '/api/v1/core/divisions',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useDivision = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.divisions.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Division>>(
        `/api/v1/core/divisions/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DivisionCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Division>>(
        '/api/v1/core/divisions',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.divisions.all });
    },
  });
};

export const useUpdateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<DivisionCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Division>>(
        `/api/v1/core/divisions/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.divisions.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.divisions.detail(id) });
    },
  });
};

export const useDeleteDivision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/divisions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.divisions.all });
    },
  });
};

// ─── Building hooks ─────────────────────────────────────────────────────────────
export const useBuildings = (
  params?: BuildingListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.buildings.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Building>>(
        '/api/v1/core/buildings',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useBuilding = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.buildings.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Building>>(
        `/api/v1/core/buildings/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BuildingCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Building>>(
        '/api/v1/core/buildings',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.buildings.all });
    },
  });
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<BuildingCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Building>>(
        `/api/v1/core/buildings/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.buildings.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.buildings.detail(id) });
    },
  });
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/buildings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.buildings.all });
    },
  });
};

// ─── Floor hooks ──────────────────────────────────────────────────────────────
export const useFloors = (
  params?: FloorListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.floors.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Floor>>(
        '/api/v1/core/floors',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useFloor = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.floors.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Floor>>(
        `/api/v1/core/floors/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FloorCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Floor>>(
        '/api/v1/core/floors',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.floors.all });
    },
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<FloorCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Floor>>(
        `/api/v1/core/floors/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.floors.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.floors.detail(id) });
    },
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/floors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.floors.all });
    },
  });
};

// ─── RoomType hooks ───────────────────────────────────────────────────────────
export const useRoomTypes = (
  params?: RoomTypeListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.roomTypes.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<RoomType>>(
        '/api/v1/core/room-types',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useRoomType = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.roomTypes.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<RoomType>>(
        `/api/v1/core/room-types/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RoomTypeCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<RoomType>>(
        '/api/v1/core/room-types',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.roomTypes.all });
    },
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<RoomTypeCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<RoomType>>(
        `/api/v1/core/room-types/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.roomTypes.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.roomTypes.detail(id) });
    },
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/room-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.roomTypes.all });
    },
  });
};

// ─── Room hooks ───────────────────────────────────────────────────────────────
export const useRooms = (
  params?: RoomListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.rooms.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Room>>(
        '/api/v1/core/rooms',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useRoom = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.rooms.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Room>>(
        `/api/v1/core/rooms/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RoomCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Room>>(
        '/api/v1/core/rooms',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.rooms.all });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<RoomCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Room>>(
        `/api/v1/core/rooms/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.rooms.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.rooms.detail(id) });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.rooms.all });
    },
  });
};

// ─── AcademicYear hooks ────────────────────────────────────────────────────────
export const useAcademicYears = (
  params?: AcademicYearListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.academicYears.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<AcademicYear>>(
        '/api/v1/core/academic-years',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useAcademicYear = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.academicYears.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<AcademicYear>>(
        `/api/v1/core/academic-years/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AcademicYearCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<AcademicYear>>(
        '/api/v1/core/academic-years',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.academicYears.all });
    },
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<AcademicYearCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<AcademicYear>>(
        `/api/v1/core/academic-years/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.academicYears.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.academicYears.detail(id) });
    },
  });
};

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/academic-years/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.academicYears.all });
    },
  });
};

// ─── Semester hooks ────────────────────────────────────────────────────────────
export const useSemesters = (
  params?: SemesterListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.semesters.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Semester>>(
        '/api/v1/core/semesters',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useSemester = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.semesters.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Semester>>(
        `/api/v1/core/semesters/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SemesterCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Semester>>(
        '/api/v1/core/semesters',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.semesters.all });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<SemesterCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Semester>>(
        `/api/v1/core/semesters/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.semesters.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.semesters.detail(id) });
    },
  });
};

export const useDeleteSemester = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/semesters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.semesters.all });
    },
  });
};

// ─── MasterGroup hooks ────────────────────────────────────────────────────────
export const useMasterGroups = (
  params?: MasterGroupListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.masterGroups.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<MasterGroup>>(
        '/api/v1/core/master-groups',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useMasterGroup = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.masterGroups.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<MasterGroup>>(
        `/api/v1/core/master-groups/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateMasterGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MasterGroupCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<MasterGroup>>(
        '/api/v1/core/master-groups',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterGroups.all });
    },
  });
};

export const useUpdateMasterGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<MasterGroupCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<MasterGroup>>(
        `/api/v1/core/master-groups/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterGroups.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterGroups.detail(id) });
    },
  });
};

export const useDeleteMasterGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/master-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterGroups.all });
    },
  });
};

// ─── MasterValue hooks ───────────────────────────────────────────────────────
export const useMasterValues = (
  params?: MasterValueListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.masterValues.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<MasterValue>>(
        '/api/v1/core/master-values',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useMasterValue = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.masterValues.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<MasterValue>>(
        `/api/v1/core/master-values/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateMasterValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MasterValueCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<MasterValue>>(
        '/api/v1/core/master-values',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterValues.all });
    },
  });
};

export const useUpdateMasterValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<MasterValueCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<MasterValue>>(
        `/api/v1/core/master-values/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterValues.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterValues.detail(id) });
    },
  });
};

export const useDeleteMasterValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/master-values/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.masterValues.all });
    },
  });
};

// ─── Country hooks ─────────────────────────────────────────────────────────────
export const useCountries = (
  params?: CountryListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.countries.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Country>>(
        '/api/v1/core/countries',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useCountry = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.countries.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Country>>(
        `/api/v1/core/countries/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CountryCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Country>>(
        '/api/v1/core/countries',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.countries.all });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CountryCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Country>>(
        `/api/v1/core/countries/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.countries.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.countries.detail(id) });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/countries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.countries.all });
    },
  });
};

// ─── Province hooks ────────────────────────────────────────────────────────────
export const useProvinces = (
  params?: ProvinceListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.provinces.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Province>>(
        '/api/v1/core/provinces',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useProvince = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.provinces.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Province>>(
        `/api/v1/core/provinces/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProvinceCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Province>>(
        '/api/v1/core/provinces',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.provinces.all });
    },
  });
};

export const useUpdateProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ProvinceCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Province>>(
        `/api/v1/core/provinces/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.provinces.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.provinces.detail(id) });
    },
  });
};

export const useDeleteProvince = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/provinces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.provinces.all });
    },
  });
};

// ─── District hooks ────────────────────────────────────────────────────────────
export const useDistricts = (
  params?: DistrictListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.districts.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<District>>(
        '/api/v1/core/districts',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useDistrict = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.districts.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<District>>(
        `/api/v1/core/districts/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DistrictCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<District>>(
        '/api/v1/core/districts',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.districts.all });
    },
  });
};

export const useUpdateDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<DistrictCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<District>>(
        `/api/v1/core/districts/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.districts.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.districts.detail(id) });
    },
  });
};

export const useDeleteDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/districts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.districts.all });
    },
  });
};

// ─── Ward hooks ────────────────────────────────────────────────────────────────
export const useWards = (
  params?: WardListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.wards.list(params),
    queryFn: async () => {
      const response = await coreApi.get<CoreListResponse<Ward>>(
        '/api/v1/core/wards',
        { params }
      );
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 30000,
  });
};

export const useWard = (id?: number | string) => {
  return useQuery({
    queryKey: CORE_QUERY_KEYS.wards.detail(id ?? ''),
    queryFn: async () => {
      const response = await coreApi.get<CoreDetailResponse<Ward>>(
        `/api/v1/core/wards/${id}`
      );
      return response.data;
    },
    enabled: id !== undefined && id !== null,
    staleTime: 30000,
  });
};

export const useCreateWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WardCreatePayload) => {
      const response = await coreApi.post<CoreDetailResponse<Ward>>(
        '/api/v1/core/wards',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.wards.all });
    },
  });
};

export const useUpdateWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<WardCreatePayload> }) => {
      const response = await coreApi.put<CoreDetailResponse<Ward>>(
        `/api/v1/core/wards/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.wards.all });
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.wards.detail(id) });
    },
  });
};

export const useDeleteWard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreApi.delete(`/api/v1/core/wards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CORE_QUERY_KEYS.wards.all });
    },
  });
};

// ─── HQNhat API Types ─────────────────────────────────────────────────────
// TypeScript types derived from the HQNhat OpenAPI spec
// (https://api.hqnhat.id.vn/docs?api-docs.json)

export interface HqnhatMajor {
  id: number;
  department_id: number;
  code: string;
  name: string;
  degree_level: number; // 1: Đại học, 2: Thạc sĩ, 3: Tiến sĩ
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatSpecialization {
  id: number;
  major_id: number;
  code: string;
  name: string;
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HqnhatTrainingSystem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: number; // 0: inactive, 1: active
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

// ─── Response envelope ────────────────────────────────────────────────────
export interface HqnhatPaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface HqnhatListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: HqnhatPaginationMeta;
}

export interface HqnhatDetailResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Query parameter types ────────────────────────────────────────────────
export interface HqnhatMajorListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  department_id?: number;
  code?: string;
  name?: string;
  degree_level?: number;
  status?: 0 | 1;
  include_deleted?: boolean; // Backend: lọc record đã xóa (soft delete)
}

export interface HqnhatSpecializationListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  major_id?: number;
  code?: string;
  name?: string;
  status?: 0 | 1;
}

export interface HqnhatTrainingSystemListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  code?: string;
  name?: string;
  status?: 0 | 1;
}

export interface HqnhatMajorCreatePayload {
  department_id: number;
  code: string;
  name: string;
  degree_level: number; // 1: Đại học, 2: Thạc sĩ, 3: Tiến sĩ
  description?: string;
  status?: 0 | 1; // default 1
}

export interface HqnhatSpecializationCreatePayload {
  major_id: number;
  code: string;
  name: string;
  description?: string;
  status?: 0 | 1; // default 1
}

export interface HqnhatTrainingSystemCreatePayload {
  code: string;
  name: string;
  description?: string;
  status?: 0 | 1; // default 1
}